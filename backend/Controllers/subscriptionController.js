import subscriptionService from "../Services/payments/subscription.service.js";
import premiumAccessService from "../Services/payments/premiumAccess.service.js";
import subscriptionExpiryService from "../Services/payments/subscriptionExpiry.service.js";

const handleError = (res, error, fallbackMessage) =>
  res.status(error?.statusCode || 500).json({
    success: false,
    message: error?.message || fallbackMessage,
  });

export const createSubscription = async (req, res) => {
  try {
    const { planId } = req.validated?.body || req.body;
    const subscription = await subscriptionService.createPendingSubscription({
      userUid: req.user.uid,
      planId,
    });

    return res.status(201).json({
      success: true,
      message: "Subscription intent created successfully",
      subscription,
    });
  } catch (error) {
    console.error("Error creating subscription:", error);
    return handleError(res, error, "Failed to create subscription");
  }
};

export const getCurrentSubscription = async (req, res) => {
  try {
    const subscription = await subscriptionService.getCurrentSubscriptionForUser(
      req.user.uid
    );

    return res.status(200).json({
      success: true,
      subscription,
    });
  } catch (error) {
    console.error("Error fetching current subscription:", error);
    return handleError(res, error, "Failed to fetch current subscription");
  }
};

export const getSubscriptionHistory = async (req, res) => {
  try {
    const subscriptions = await subscriptionService.listSubscriptionsForUser(
      req.user.uid
    );

    return res.status(200).json({
      success: true,
      subscriptions,
    });
  } catch (error) {
    console.error("Error fetching subscription history:", error);
    return handleError(res, error, "Failed to fetch subscription history");
  }
};

export const getMembershipAccess = async (req, res) => {
  try {
    const access = await premiumAccessService.resolveMembershipAccessForUser(
      req.user.uid
    );

    return res.status(200).json({
      success: true,
      access,
    });
  } catch (error) {
    console.error("Error fetching membership access:", error);
    return handleError(res, error, "Failed to fetch membership access");
  }
};

export const runSubscriptionExpirySync = async (req, res) => {
  try {
    const limit = req.body?.limit ?? req.query?.limit;
    const summary = await subscriptionExpiryService.runExpirySync({
      source: "manual_admin_sync",
      limit,
    });

    return res.status(200).json({
      success: true,
      message: "Subscription expiry sync completed",
      summary,
    });
  } catch (error) {
    console.error("Error running subscription expiry sync:", error);
    return handleError(res, error, "Failed to run subscription expiry sync");
  }
};
