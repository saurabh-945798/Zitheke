import adminSubscriptionAnalyticsService from "../Services/payments/adminSubscriptionAnalytics.service.js";
import paymentReconciliationService from "../Services/payments/paymentReconciliation.service.js";

const handleError = (res, error, fallbackMessage) =>
  res.status(error?.statusCode || 500).json({
    success: false,
    message: error?.message || fallbackMessage,
  });

export const getSubscriptionAnalyticsSummary = async (req, res) => {
  try {
    const data = await adminSubscriptionAnalyticsService.getSummary();
    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Error fetching subscription analytics summary:", error);
    return handleError(
      res,
      error,
      "Failed to fetch subscription analytics summary"
    );
  }
};

export const getSubscriptionAnalyticsPlans = async (req, res) => {
  try {
    const data = await adminSubscriptionAnalyticsService.getPlanAnalytics();
    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Error fetching subscription analytics by plan:", error);
    return handleError(
      res,
      error,
      "Failed to fetch subscription analytics by plan"
    );
  }
};

export const getSubscriptionAnalyticsSubscriptions = async (req, res) => {
  try {
    const result = await adminSubscriptionAnalyticsService.getSubscriptionAnalytics(
      req.query
    );

    return res.status(200).json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error("Error fetching subscription analytics subscriptions:", error);
    return handleError(
      res,
      error,
      "Failed to fetch subscription analytics subscriptions"
    );
  }
};

export const getSubscriptionAnalyticsPayments = async (req, res) => {
  try {
    const result = await adminSubscriptionAnalyticsService.getPaymentAnalytics(
      req.query
    );

    return res.status(200).json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error("Error fetching subscription analytics payments:", error);
    return handleError(
      res,
      error,
      "Failed to fetch subscription analytics payments"
    );
  }
};

export const reconcilePendingPayments = async (req, res) => {
  try {
    const data =
      await paymentReconciliationService.reconcilePendingPaymentsOnce({
        source: "admin_manual",
      });

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Error reconciling pending payments:", error);
    return handleError(res, error, "Failed to reconcile pending payments");
  }
};
