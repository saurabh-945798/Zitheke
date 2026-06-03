import paymentOrchestratorService from "../Services/payments/paymentOrchestrator.service.js";
import paymentVerificationService from "../Services/payments/paymentVerification.service.js";

const logPaymentError = (label, error) => {
  console.error(label, {
    message: error?.message || "Unknown error",
    statusCode: error?.statusCode || 500,
    code: error?.code || error?.gatewayCode || "",
    type: error?.type || "",
  });
};

const handleError = (res, error, fallbackMessage) =>
  res.status(error?.statusCode || 500).json({
    success: false,
    type: error?.type || null,
    code: error?.code || error?.gatewayCode || "",
    message: error?.message || fallbackMessage,
    paymentStatus: error?.paymentStatus || null,
    gateway:
      error?.gatewayCode || error?.gatewayMessage
        ? {
            code: error?.code || error?.gatewayCode || "",
            message: error?.gatewayMessage || "",
          }
        : null,
  });

export const createPaymentIntent = async (req, res) => {
  try {
    const { subscriptionId, gateway, paymentMethod, msisdn, idempotencyKey } =
      req.validated?.body || req.body;

    const result = await paymentOrchestratorService.createPaymentIntent({
      userUid: req.user.uid,
      subscriptionId,
      gateway,
      paymentMethod,
      msisdn,
      idempotencyKey,
    });

    return res.status(result.reused ? 200 : 201).json({
      success: true,
      message: result.reused
        ? "Existing payment intent returned"
        : "Payment intent created successfully",
      payment: result.payment,
      gateway: result.gateway,
      initiation: result.initiation,
      reused: result.reused,
    });
  } catch (error) {
    logPaymentError("Error creating payment intent", error);
    return handleError(res, error, "Failed to create payment intent");
  }
};

export const getPaymentById = async (req, res) => {
  try {
    const { paymentId } = req.validated?.params || req.params;
    const payment = await paymentOrchestratorService.getPaymentByIdForUser({
      userUid: req.user.uid,
      paymentId,
    });

    return res.status(200).json({
      success: true,
      payment,
    });
  } catch (error) {
    logPaymentError("Error fetching payment", error);
    return handleError(res, error, "Failed to fetch payment");
  }
};

export const getPaymentHistory = async (req, res) => {
  try {
    const payments = await paymentOrchestratorService.listPaymentsForUser(
      req.user.uid
    );

    return res.status(200).json({
      success: true,
      payments,
    });
  } catch (error) {
    logPaymentError("Error fetching payment history", error);
    return handleError(res, error, "Failed to fetch payment history");
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { paymentId } = req.validated?.params || req.params;
    const result = await paymentVerificationService.verifyPaymentForUser({
      userUid: req.user.uid,
      paymentId,
    });

    return res.status(200).json({
      success: true,
      message: result.reused
        ? "Payment already verified"
        : "Payment verification completed",
      payment: result.payment,
      subscription: result.subscription || null,
      verification: result.verification,
      reused: result.reused,
    });
  } catch (error) {
    logPaymentError("Error verifying payment", error);
    return handleError(res, error, "Failed to verify payment");
  }
};
