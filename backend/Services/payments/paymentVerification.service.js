import mongoose from "mongoose";
import User from "../../models/User.js";
import Payment from "../../models/Payment.js";
import PaymentEvent from "../../models/PaymentEvent.js";
import { PAYMENT_GATEWAYS } from "../../constants/paymentGateways.js";
import { PAYMENT_STATUSES } from "../../constants/paymentStatuses.js";
import { PAYMENT_VERIFICATION_STATUSES } from "../../constants/paymentVerificationStatuses.js";
import AirtelGateway from "./gateways/airtel.gateway.js";
import subscriptionService from "./subscription.service.js";

const createError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const assertObjectId = (value, label) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw createError(400, `Invalid ${label}`);
  }
};

const gateways = {
  [PAYMENT_GATEWAYS.AIRTEL_MONEY]: new AirtelGateway(),
};

const resolveGateway = (gatewayCode) => {
  const gateway = gateways[gatewayCode];
  if (!gateway) {
    throw createError(400, `Gateway '${gatewayCode}' does not support verification yet`);
  }
  return gateway;
};

const resolveUserByUid = async (userUid) => {
  const user = await User.findOne({ uid: userUid }).select("_id uid");
  if (!user) {
    throw createError(404, "Authenticated user not found");
  }
  return user;
};

const mapVerificationToPaymentStatus = (status) => {
  if (status === "paid") {
    return {
      paymentStatus: PAYMENT_STATUSES.PAID,
      verificationStatus: PAYMENT_VERIFICATION_STATUSES.VERIFIED,
    };
  }

  if (
    status === "pending" ||
    status === "initiated" ||
    status === "pending_verification"
  ) {
    return {
      paymentStatus:
        status === "initiated"
          ? PAYMENT_STATUSES.INITIATED
          : status === "pending_verification"
          ? PAYMENT_STATUSES.PENDING_VERIFICATION
          : PAYMENT_STATUSES.PENDING,
      verificationStatus:
        status === "pending_verification"
          ? PAYMENT_VERIFICATION_STATUSES.PENDING_VERIFICATION
          : PAYMENT_VERIFICATION_STATUSES.PENDING,
    };
  }

  if (status === "expired") {
    return {
      paymentStatus: PAYMENT_STATUSES.EXPIRED,
      verificationStatus: PAYMENT_VERIFICATION_STATUSES.EXPIRED,
    };
  }

  if (status === "cancelled") {
    return {
      paymentStatus: PAYMENT_STATUSES.CANCELLED,
      verificationStatus: PAYMENT_VERIFICATION_STATUSES.FAILED,
    };
  }

  return {
    paymentStatus: PAYMENT_STATUSES.FAILED,
    verificationStatus: PAYMENT_VERIFICATION_STATUSES.FAILED,
  };
};

const verifyPaymentForUser = async ({ userUid, paymentId }) => {
  assertObjectId(paymentId, "paymentId");
  const user = await resolveUserByUid(userUid);

  const payment = await Payment.findOne({
    _id: paymentId,
    userId: user._id,
  }).populate({
    path: "subscriptionId",
    populate: { path: "planId" },
  });

  if (!payment) {
    throw createError(404, "Payment not found");
  }

  if (payment.verificationStatus === PAYMENT_VERIFICATION_STATUSES.VERIFIED) {
    return {
      payment,
      verification: {
        paymentId: String(payment._id),
        merchantTransactionId: payment.merchantTransactionId,
        gateway: payment.gateway,
        status: payment.status,
        verificationStatus: payment.verificationStatus,
        gatewayTransactionId: payment.gatewayTransactionId || "",
        rawGatewayStatus: "already_verified",
        customerMessage: "Payment has already been verified.",
      },
      reused: true,
    };
  }

  const gateway = resolveGateway(payment.gateway);

  try {
    const verification = await gateway.verifyPayment({ payment });
    const nextState = mapVerificationToPaymentStatus(verification.normalizedResponse.status);
    let activatedSubscription = null;

    if (nextState.paymentStatus === PAYMENT_STATUSES.PAID) {
      const session = await mongoose.startSession();
      try {
        await session.withTransaction(async () => {
          const paymentInTx = await Payment.findById(payment._id).session(session);
          if (!paymentInTx) {
            throw createError(404, "Payment not found during verification transaction");
          }

          paymentInTx.status = nextState.paymentStatus;
          paymentInTx.verificationStatus = nextState.verificationStatus;
          paymentInTx.gatewayTransactionId =
            verification.normalizedResponse.gatewayTransactionId ||
            paymentInTx.gatewayTransactionId ||
            "";
          paymentInTx.failureReason = "";
          paymentInTx.paidAt = paymentInTx.paidAt || new Date();
          paymentInTx.rawRequestPayload = {
            ...(paymentInTx.rawRequestPayload || {}),
            verification: verification.rawRequestPayload,
          };
          paymentInTx.rawResponsePayload = {
            ...(paymentInTx.rawResponsePayload || {}),
            verification: verification.rawResponsePayload,
          };
          await paymentInTx.save({ session });

          activatedSubscription =
            await subscriptionService.activateSubscriptionForVerifiedPayment({
              subscriptionId: payment.subscriptionId._id,
              paymentId: payment._id,
              session,
            });
        });
      } finally {
        await session.endSession();
      }
    } else {
      payment.status = nextState.paymentStatus;
      payment.verificationStatus = nextState.verificationStatus;
      payment.gatewayTransactionId =
        verification.normalizedResponse.gatewayTransactionId ||
        payment.gatewayTransactionId ||
        "";
      payment.failureReason =
        nextState.paymentStatus === PAYMENT_STATUSES.PAID
          ? ""
          : verification.normalizedResponse.customerMessage || payment.failureReason;
      payment.rawRequestPayload = {
        ...(payment.rawRequestPayload || {}),
        verification: verification.rawRequestPayload,
      };
      payment.rawResponsePayload = {
        ...(payment.rawResponsePayload || {}),
        verification: verification.rawResponsePayload,
      };
      await payment.save();
    }

    await PaymentEvent.create({
      paymentId: payment._id,
      eventType:
        nextState.paymentStatus === PAYMENT_STATUSES.PAID
          ? "payment_verified_and_subscription_activated"
          : "payment_verification_attempted",
      source: "gateway",
      rawPayload: verification.rawResponsePayload,
      normalizedPayload: verification.normalizedResponse,
    });

    const hydratedPayment = await Payment.findById(payment._id).populate({
      path: "subscriptionId",
      populate: { path: "planId" },
    });

    return {
      payment: hydratedPayment,
      subscription: activatedSubscription,
      verification: verification.normalizedResponse,
      reused: false,
    };
  } catch (error) {
    const isGatewayConfigurationError = Boolean(
      error?.isGatewayConfigurationError ||
        error?.code === "ROUTER003" ||
        error?.gatewayCode === "ROUTER003"
    );

    if (isGatewayConfigurationError) {
      payment.status = PAYMENT_STATUSES.PENDING_VERIFICATION;
      payment.verificationStatus =
        PAYMENT_VERIFICATION_STATUSES.GATEWAY_CONFIGURATION_ERROR;
      payment.gatewayCode = error?.code || error?.gatewayCode || "ROUTER003";
      payment.gatewayMessage =
        error?.gatewayMessage ||
        "Airtel sandbox verification is not enabled for this partner/country configuration.";
      payment.lastVerificationAttemptAt = new Date();
      payment.failureReason = payment.gatewayMessage;
      payment.rawVerificationResponse = error?.rawResponse || null;
      if (error?.rawRequest) {
        payment.rawRequestPayload = {
          ...(payment.rawRequestPayload || {}),
          verification: error.rawRequest,
        };
      }
      if (error?.rawResponse || error?.oauthResponse) {
        payment.rawResponsePayload = {
          ...(payment.rawResponsePayload || {}),
          verification: {
            oauth: error?.oauthResponse || null,
            verification: error?.rawResponse || null,
          },
        };
      }
      await payment.save();

      await PaymentEvent.create({
        paymentId: payment._id,
        eventType: "payment_verification_gateway_configuration_error",
        source: "gateway",
        rawPayload: error?.rawResponse || null,
        normalizedPayload: {
          code: payment.gatewayCode,
          message: payment.gatewayMessage,
        },
      });

      console.warn("Airtel verification gateway configuration error", {
        paymentId: String(payment._id),
        reference:
          String(payment?.gatewayTransactionId || "").trim() ||
          String(payment?.merchantTransactionId || "").trim(),
        gateway: payment.gateway,
        country: "MW",
        currency: payment.currency,
        airtelStatusCode: payment.gatewayCode,
        airtelStatusMessage: payment.gatewayMessage,
      });

      error.statusCode = error?.statusCode || 502;
      error.type = "GATEWAY_CONFIGURATION_ERROR";
      error.paymentStatus = PAYMENT_STATUSES.PENDING_VERIFICATION;
      throw error;
    }

    payment.verificationStatus = PAYMENT_VERIFICATION_STATUSES.PENDING;
    payment.lastVerificationAttemptAt = new Date();
    payment.retryCount = Number(payment.retryCount || 0) + 1;
    payment.failureReason = error?.message || "Payment verification failed";
    if (error?.rawRequest) {
      payment.rawRequestPayload = {
        ...(payment.rawRequestPayload || {}),
        verification: error.rawRequest,
      };
    }
    if (error?.rawResponse || error?.oauthResponse) {
      payment.rawResponsePayload = {
        ...(payment.rawResponsePayload || {}),
        verification: {
          oauth: error?.oauthResponse || null,
          verification: error?.rawResponse || null,
        },
      };
    }
    await payment.save();

    await PaymentEvent.create({
      paymentId: payment._id,
      eventType: "payment_verification_failed",
      source: "gateway",
      rawPayload: error?.rawResponse || null,
      normalizedPayload: {
        message: error?.message || "Payment verification failed",
      },
    });

    throw error;
  }
};

export default {
  verifyPaymentForUser,
};
