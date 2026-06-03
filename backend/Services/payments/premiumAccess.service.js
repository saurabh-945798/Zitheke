import User from "../../models/User.js";
import Subscription from "../../models/Subscription.js";
import { SUBSCRIPTION_STATUSES } from "../../constants/subscriptionStatuses.js";
import {
  MEMBERSHIP_PLANS,
  getMembershipPlanDefinition,
} from "../../constants/membershipPlans.js";

const createError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const normalizeFeatureKey = (feature = "") =>
  String(feature || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

const buildAccessPayload = ({
  user,
  plan,
  subscription = null,
  accessSource = "free_fallback",
  requiresExpirySync = false,
}) => {
  const featureList = Array.isArray(plan?.features) ? plan.features : [];
  const featureMap = featureList.reduce((acc, feature) => {
    const key = normalizeFeatureKey(feature);
    if (key) acc[key] = true;
    return acc;
  }, {});

  const planSlug = String(plan?.slug || MEMBERSHIP_PLANS.FREE).toLowerCase();

  return {
    userId: String(user?._id || ""),
    userUid: String(user?.uid || ""),
    plan: {
      id: plan?._id ? String(plan._id) : null,
      name: plan?.name || "FREE",
      slug: planSlug,
      price: Number(plan?.price || 0),
      currency: plan?.currency || "MWK",
      durationDays: Number(plan?.durationDays || 0),
      priorityLevel: Number(plan?.priorityLevel || 0),
      isActive: Boolean(plan?.isActive ?? true),
      features: featureList,
    },
    subscription: subscription
      ? {
          id: String(subscription._id),
          status: subscription.status,
          startDate: subscription.startDate,
          endDate: subscription.endDate,
          activatedAt: subscription.activatedAt,
          expiredAt: subscription.expiredAt,
          paymentId: subscription.paymentId
            ? String(subscription.paymentId._id || subscription.paymentId)
            : null,
          autoDowngraded: Boolean(subscription.autoDowngraded),
        }
      : null,
    isPremium: planSlug !== MEMBERSHIP_PLANS.FREE,
    hasActiveSubscription: Boolean(subscription),
    featureMap,
    accessSource,
    requiresExpirySync,
    checkedAt: new Date(),
  };
};

const resolveUserByUid = async (userUid) => {
  const user = await User.findOne({ uid: userUid }).select("_id uid email name");
  if (!user) {
    throw createError(404, "Authenticated user not found");
  }
  return user;
};

const resolveMembershipAccessForUser = async (userUid) => {
  const user = await resolveUserByUid(userUid);
  const subscription = await Subscription.findOne({
    userId: user._id,
    status: SUBSCRIPTION_STATUSES.ACTIVE,
  })
    .populate("planId")
    .populate("paymentId")
    .sort({ endDate: -1 });

  if (!subscription || !subscription.planId) {
    return buildAccessPayload({
      user,
      plan: getMembershipPlanDefinition(MEMBERSHIP_PLANS.FREE),
      accessSource: "free_fallback",
    });
  }

  const now = new Date();
  const isExpiredByDate =
    subscription.endDate instanceof Date && subscription.endDate.getTime() < now.getTime();

  if (isExpiredByDate) {
    return buildAccessPayload({
      user,
      plan: getMembershipPlanDefinition(MEMBERSHIP_PLANS.FREE),
      accessSource: "expired_active_subscription",
      requiresExpirySync: true,
    });
  }

  return buildAccessPayload({
    user,
    plan: subscription.planId,
    subscription,
    accessSource: "active_subscription",
  });
};

export default {
  resolveMembershipAccessForUser,
};
