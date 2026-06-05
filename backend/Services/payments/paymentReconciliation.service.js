import Payment from "../../models/Payment.js";
import PaymentEvent from "../../models/PaymentEvent.js";
import { PAYMENT_GATEWAYS } from "../../constants/paymentGateways.js";
import { PAYMENT_STATUSES } from "../../constants/paymentStatuses.js";
import { PAYMENT_VERIFICATION_STATUSES } from "../../constants/paymentVerificationStatuses.js";
import paymentVerificationService from "./paymentVerification.service.js";
import { env } from "../../config/env.js";

const OPEN_PAYMENT_STATUSES = Object.freeze([
  PAYMENT_STATUSES.CREATED,
  PAYMENT_STATUSES.INITIATED,
  PAYMENT_STATUSES.PENDING,
  PAYMENT_STATUSES.PENDING_VERIFICATION,
]);

let reconciliationTimer = null;
let isRunning = false;

const getRuntimeConfig = () => ({
  enabled: env.PAYMENT_RECONCILIATION_ENABLED,
  intervalMs: env.PAYMENT_RECONCILIATION_INTERVAL_MS,
  maxAgeMinutes: env.PAYMENT_RECONCILIATION_MAX_AGE_MINUTES,
  batchSize: env.PAYMENT_RECONCILIATION_BATCH_SIZE,
  maxRetries: env.PAYMENT_RECONCILIATION_MAX_RETRIES,
});

const createWindowStart = (maxAgeMinutes) =>
  new Date(Date.now() - maxAgeMinutes * 60 * 1000);

const extractAirtelTransactionStatus = (verification = null) =>
  verification?.rawResponsePayload?.verification?.data?.transaction?.status ||
  verification?.rawResponsePayload?.verification?.transaction?.status ||
  verification?.normalizedResponse?.rawGatewayStatus ||
  "";

const reconcilePendingPaymentsOnce = async ({ source = "scheduler" } = {}) => {
  if (isRunning) {
    console.info(
      "Skipping Airtel payment reconciliation because a run is already in progress",
      { source }
    );
    return {
      checked: 0,
      paid: 0,
      failed: 0,
      pending: 0,
      errors: 0,
      skipped: true,
    };
  }

  const config = getRuntimeConfig();
  const windowStart = createWindowStart(config.maxAgeMinutes);
  const summary = {
    checked: 0,
    paid: 0,
    failed: 0,
    pending: 0,
    errors: 0,
    skipped: false,
  };

  isRunning = true;
  console.info("Starting Airtel payment reconciliation run", {
    source,
    batchSize: config.batchSize,
    maxAgeMinutes: config.maxAgeMinutes,
    maxRetries: config.maxRetries,
  });

  try {
    const pendingPayments = await Payment.find({
      $or: [
        { gateway: PAYMENT_GATEWAYS.AIRTEL_MONEY },
        { paymentMethod: PAYMENT_GATEWAYS.AIRTEL_MONEY },
      ],
      status: { $in: OPEN_PAYMENT_STATUSES },
      verificationStatus: { $ne: PAYMENT_VERIFICATION_STATUSES.VERIFIED },
      createdAt: { $gte: windowStart },
      retryCount: { $lt: config.maxRetries },
    })
      .sort({ createdAt: 1 })
      .limit(config.batchSize)
      .populate({
        path: "subscriptionId",
        populate: { path: "planId" },
      });

    for (const payment of pendingPayments) {
      summary.checked += 1;

      try {
        const result = await paymentVerificationService.verifyPaymentRecord({
          paymentDoc: payment,
          source,
        });

        const finalPayment = result?.payment || payment;
        const finalStatus = String(finalPayment?.status || "").trim();
        const finalVerificationStatus = String(
          finalPayment?.verificationStatus || ""
        ).trim();
        const airtelTransactionStatus = extractAirtelTransactionStatus(
          result?.verification
        );

        if (finalStatus === PAYMENT_STATUSES.PAID) {
          summary.paid += 1;
        } else if (
          finalStatus === PAYMENT_STATUSES.FAILED ||
          finalStatus === PAYMENT_STATUSES.CANCELLED ||
          finalStatus === PAYMENT_STATUSES.EXPIRED
        ) {
          summary.failed += 1;
        } else {
          summary.pending += 1;
        }

        console.info("Reconciled Airtel payment", {
          source,
          paymentId: String(finalPayment?._id || payment._id),
          merchantTransactionId:
            finalPayment?.merchantTransactionId || payment.merchantTransactionId,
          previousPaymentStatus: payment.status,
          airtelTransactionStatus,
          normalizedStatus: result?.verification?.status || "",
          finalPaymentStatus: finalStatus,
          verificationStatus: finalVerificationStatus,
          subscriptionActivationResult:
            result?.subscription?.status ||
            (finalStatus === PAYMENT_STATUSES.PAID
              ? "paid_no_change"
              : "not_activated"),
        });
      } catch (error) {
        summary.errors += 1;

        console.error("Pending Airtel payment reconciliation failed", {
          source,
          paymentId: String(payment._id),
          merchantTransactionId: payment.merchantTransactionId,
          previousPaymentStatus: payment.status,
          message: error?.message || "Unknown reconciliation error",
        });

        await PaymentEvent.create({
          paymentId: payment._id,
          eventType: "payment_reconciliation_error",
          source,
          rawPayload: null,
          normalizedPayload: {
            message: error?.message || "Pending payment reconciliation failed",
          },
        });
      }
    }

    console.info("Completed Airtel payment reconciliation run", {
      source,
      checked: summary.checked,
      paid: summary.paid,
      failed: summary.failed,
      pending: summary.pending,
      errors: summary.errors,
    });

    return summary;
  } finally {
    isRunning = false;
  }
};

const startPaymentReconciliationScheduler = () => {
  const config = getRuntimeConfig();

  if (!config.enabled) {
    console.info("Airtel payment reconciliation scheduler is disabled");
    return false;
  }

  if (reconciliationTimer) {
    console.info("Airtel payment reconciliation scheduler is already running");
    return true;
  }

  reconciliationTimer = setInterval(() => {
    reconcilePendingPaymentsOnce({ source: "scheduler" }).catch((error) => {
      console.error("Airtel payment reconciliation scheduler run failed", {
        message: error?.message || "Unknown scheduler error",
      });
    });
  }, config.intervalMs);

  console.info("Airtel payment reconciliation scheduler started", {
    intervalMs: config.intervalMs,
  });
  return true;
};

const stopPaymentReconciliationScheduler = () => {
  if (!reconciliationTimer) return false;
  clearInterval(reconciliationTimer);
  reconciliationTimer = null;
  console.info("Airtel payment reconciliation scheduler stopped");
  return true;
};

export default {
  getRuntimeConfig,
  reconcilePendingPaymentsOnce,
  startPaymentReconciliationScheduler,
  stopPaymentReconciliationScheduler,
};
