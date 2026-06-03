import mongoose from "mongoose";
import crypto from "crypto";
import User from "../../models/User.js";
import Subscription from "../../models/Subscription.js";
import Payment from "../../models/Payment.js";
import PaymentEvent from "../../models/PaymentEvent.js";
import { PAYMENT_STATUSES } from "../../constants/paymentStatuses.js";
import { PAYMENT_VERIFICATION_STATUSES } from "../../constants/paymentVerificationStatuses.js";
import { PAYMENT_GATEWAYS } from "../../constants/paymentGateways.js";
import { SUBSCRIPTION_STATUSES } from "../../constants/subscriptionStatuses.js";
import { ALLOWED_PREMIUM_PLAN_AMOUNTS } from "../../constants/membershipPlans.js";
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

const OPEN_PAYMENT_STATUSES = [
  PAYMENT_STATUSES.CREATED,
  PAYMENT_STATUSES.INITIATED,
  PAYMENT_STATUSES.PENDING,
  PAYMENT_STATUSES.PENDING_VERIFICATION,
];

const PAYMENT_REUSE_WINDOW_MS = 3 * 60 * 1000;

const gateways = {
  [PAYMENT_GATEWAYS.AIRTEL_MONEY]: new AirtelGateway(),
};

const resolveGateway = (gatewayCode) => {
  const gateway = gateways[gatewayCode];
  if (!gateway) {
    throw createError(400, `Gateway '${gatewayCode}' is not configured in Phase 1`);
  }
  return gateway;
};

const resolveUserByUid = async (userUid) => {
  const user = await User.findOne({ uid: userUid }).select("_id uid email name");
  if (!user) {
    throw createError(404, "Authenticated user not found");
  }
  return user;
};

const generateMerchantTransactionId = () =>
  `ZTK${Date.now()}${crypto
    .randomUUID()
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(0, 12)
    .toUpperCase()}`;

const isReusableOpenPayment = (payment) => {
  const createdAt = new Date(payment?.createdAt || 0).getTime();
  if (!createdAt) return false;
  return Date.now() - createdAt < PAYMENT_REUSE_WINDOW_MS;
};

const isExplicitGatewayCustomerFailure = (error) => {
  const combined = [
    error?.message,
    error?.gatewayMessage,
    error?.rawResponse?.message,
    error?.rawResponse?.status_message,
    error?.rawResponse?.error,
    error?.rawResponse?.data?.message,
    error?.rawResponse?.data?.error,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (!combined) return false;

  return [
    "failed",
    "failure",
    "declined",
    "rejected",
    "cancelled",
    "canceled",
    "insufficient",
    "expired",
    "wrong pin",
    "invalid pin",
  ].some((token) => combined.includes(token));
};

const getRetryableInitiationState = (error) => {
  const isCustomerFailure = isExplicitGatewayCustomerFailure(error);

  if (isCustomerFailure) {
    return {
      paymentStatus: PAYMENT_STATUSES.FAILED,
      verificationStatus: PAYMENT_VERIFICATION_STATUSES.FAILED,
      eventType: "airtel_initiation_failed",
    };
  }

  return {
    paymentStatus: PAYMENT_STATUSES.PENDING_VERIFICATION,
    verificationStatus: PAYMENT_VERIFICATION_STATUSES.PENDING,
    eventType: "airtel_initiation_retryable_error",
  };
};

const expireOpenPayment = async (payment, reason = "Previous payment request expired before confirmation.") => {
  payment.status = PAYMENT_STATUSES.EXPIRED;
  payment.verificationStatus = PAYMENT_VERIFICATION_STATUSES.EXPIRED;
  payment.failureReason = reason;
  payment.idempotencyKey = "";
  await payment.save();

  await PaymentEvent.create({
    paymentId: payment._id,
    eventType: "payment_expired_before_reuse",
    source: "system",
    normalizedPayload: {
      status: PAYMENT_STATUSES.EXPIRED,
      verificationStatus: PAYMENT_VERIFICATION_STATUSES.EXPIRED,
      reason,
    },
  });
};

const createPaymentIntent = async ({
  userUid,
  subscriptionId,
  gateway,
  paymentMethod,
  msisdn,
  idempotencyKey,
}) => {
  assertObjectId(subscriptionId, "subscriptionId");

  const user = await resolveUserByUid(userUid);
  const subscription = await Subscription.findOne({
    _id: subscriptionId,
    userId: user._id,
  }).populate("planId");

  if (!subscription) {
    throw createError(404, "Subscription not found");
  }

  if (!subscription.planId || !subscription.planId.isActive) {
    throw createError(409, "Subscription plan is inactive");
  }

  const planPrice = Number(subscription.planId.price || 0);
  if (!ALLOWED_PREMIUM_PLAN_AMOUNTS.includes(planPrice)) {
    throw createError(
      409,
      `Plan price must be one of: ${ALLOWED_PREMIUM_PLAN_AMOUNTS.join(", ")} MWK`
    );
  }

  if (subscription.status !== SUBSCRIPTION_STATUSES.PENDING) {
    throw createError(
      409,
      "Payment intent can only be created for pending subscriptions"
    );
  }

  const adapter = resolveGateway(gateway);

  if (idempotencyKey) {
    const existingByIdempotency = await Payment.findOne({
      userId: user._id,
      subscriptionId: subscription._id,
      idempotencyKey,
    }).populate({
      path: "subscriptionId",
      populate: { path: "planId" },
    });

    if (existingByIdempotency) {
      if (OPEN_PAYMENT_STATUSES.includes(existingByIdempotency.status)) {
        if (!isReusableOpenPayment(existingByIdempotency)) {
          await expireOpenPayment(existingByIdempotency);
        } else {
          return {
            payment: existingByIdempotency,
            gateway: adapter.describe(),
            initiation: {
              paymentId: String(existingByIdempotency._id),
              merchantTransactionId: existingByIdempotency.merchantTransactionId,
              gateway,
              status: existingByIdempotency.status,
              verificationStatus: existingByIdempotency.verificationStatus,
              gatewayTransactionId:
                existingByIdempotency.gatewayTransactionId || "",
              customerMessage:
                "An earlier payment request is still pending. Please check your phone or wait for verification. No new Airtel prompt was sent.",
            },
            reused: true,
          };
        }
      }
    }
  }

  const existingOpenPayment = await Payment.findOne({
    subscriptionId: subscription._id,
    status: { $in: OPEN_PAYMENT_STATUSES },
  }).populate({
    path: "subscriptionId",
    populate: { path: "planId" },
  });

  if (existingOpenPayment) {
    if (!isReusableOpenPayment(existingOpenPayment)) {
      await expireOpenPayment(existingOpenPayment);
    } else {
    return {
      payment: existingOpenPayment,
      gateway: adapter.describe(),
      initiation: {
        paymentId: String(existingOpenPayment._id),
        merchantTransactionId: existingOpenPayment.merchantTransactionId,
        gateway,
        status: existingOpenPayment.status,
        verificationStatus: existingOpenPayment.verificationStatus,
        gatewayTransactionId: existingOpenPayment.gatewayTransactionId || "",
        customerMessage:
          "An earlier payment request is still pending. Please check your phone or wait for verification. No new Airtel prompt was sent.",
      },
      reused: true,
    };
    }
  }

  const payment = await Payment.create({
    userId: user._id,
    subscriptionId: subscription._id,
    gateway,
    paymentMethod,
    payerMsisdn: "",
    amount: subscription.planId.price,
    currency: subscription.planId.currency || "MWK",
    merchantTransactionId: generateMerchantTransactionId(),
    status: PAYMENT_STATUSES.CREATED,
    verificationStatus: PAYMENT_VERIFICATION_STATUSES.UNVERIFIED,
    idempotencyKey: idempotencyKey || crypto.randomUUID(),
  });

  await subscriptionService.linkPaymentToSubscription({
    subscriptionId: subscription._id,
    paymentId: payment._id,
  });

  await PaymentEvent.create({
    paymentId: payment._id,
    eventType: "payment_created",
    source: "system",
    normalizedPayload: {
      gateway,
      paymentMethod,
      status: PAYMENT_STATUSES.CREATED,
    },
  });

  try {
    if (planPrice !== Number(payment.amount)) {
      throw createError(409, "Payment amount does not match the selected plan price");
    }

    console.info("Airtel initiation amount debug", {
      selectedPlanId: String(subscription.planId._id || ""),
      planName: subscription.planId.name || "",
      planPrice,
      paymentAmountStored: Number(payment.amount),
      airtelPayloadAmount: Number(payment.amount),
      currency: payment.currency || subscription.planId.currency || "MWK",
    });

    const initiation = await adapter.initiatePayment({
      payment,
      msisdn,
    });

    payment.payerMsisdn = initiation.payerMsisdn;
    payment.rawRequestPayload = initiation.rawRequestPayload;
    payment.rawResponsePayload = initiation.rawResponsePayload;
    payment.gatewayTransactionId = initiation.normalizedResponse.gatewayTransactionId || "";
    payment.status =
      initiation.normalizedResponse.status === "failed"
        ? PAYMENT_STATUSES.FAILED
        : initiation.normalizedResponse.status === "pending"
        ? PAYMENT_STATUSES.PENDING
        : PAYMENT_STATUSES.INITIATED;
    payment.verificationStatus = PAYMENT_VERIFICATION_STATUSES.PENDING;
    payment.failureReason =
      initiation.normalizedResponse.status === "failed"
        ? initiation.normalizedResponse.customerMessage
        : "";
    await payment.save();

    await PaymentEvent.create({
      paymentId: payment._id,
      eventType: "airtel_initiated",
      source: "gateway",
      rawPayload: initiation.rawResponsePayload,
      normalizedPayload: initiation.normalizedResponse,
    });

    const hydratedPayment = await Payment.findById(payment._id).populate({
      path: "subscriptionId",
      populate: { path: "planId" },
    });

    return {
      payment: hydratedPayment,
      gateway: adapter.describe(),
      initiation: {
        ...initiation.normalizedResponse,
        customerMessage:
          "Airtel payment request sent. Please approve the prompt on your phone.",
      },
      reused: false,
    };
  } catch (error) {
    const retryableState = getRetryableInitiationState(error);

    payment.payerMsisdn = payment.payerMsisdn || "";
    payment.status = retryableState.paymentStatus;
    payment.verificationStatus = retryableState.verificationStatus;
    payment.failureReason = error?.message || "Airtel initiation failed";
    payment.retryCount = Number(payment.retryCount || 0) + 1;
    payment.gatewayCode = error?.gatewayCode || error?.code || payment.gatewayCode || "";
    payment.gatewayMessage =
      error?.gatewayMessage || error?.message || payment.gatewayMessage || "";
    payment.lastVerificationAttemptAt = new Date();
    payment.rawVerificationResponse = error?.rawResponse || payment.rawVerificationResponse || null;
    if (error?.rawRequest) {
      payment.rawRequestPayload = error.rawRequest;
    }
    if (error?.rawResponse) {
      payment.rawResponsePayload = {
        oauth: error?.oauthResponse || payment.rawResponsePayload?.oauth || null,
        collection: error.rawResponse,
      };
    }
    await payment.save();

    await PaymentEvent.create({
      paymentId: payment._id,
      eventType: retryableState.eventType,
      source: "gateway",
      rawPayload: error?.rawResponse || null,
      normalizedPayload: {
        message: error?.message || "Airtel initiation failed",
        status: retryableState.paymentStatus,
        verificationStatus: retryableState.verificationStatus,
        gatewayCode: payment.gatewayCode || "",
        gatewayMessage: payment.gatewayMessage || "",
      },
    });

    throw error;
  }
};

const getPaymentByIdForUser = async ({ userUid, paymentId }) => {
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

  return payment;
};

const listPaymentsForUser = async (userUid) => {
  const user = await resolveUserByUid(userUid);

  return await Payment.find({ userId: user._id })
    .populate({
      path: "subscriptionId",
      populate: { path: "planId" },
    })
    .sort({ createdAt: -1 });
};

export default {
  createPaymentIntent,
  getPaymentByIdForUser,
  listPaymentsForUser,
};
