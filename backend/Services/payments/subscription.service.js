import mongoose from "mongoose";
import User from "../../models/User.js";
import Subscription from "../../models/Subscription.js";
import Plan from "../../models/Plan.js";
import { SUBSCRIPTION_STATUSES } from "../../constants/subscriptionStatuses.js";
import {
  ALLOWED_PREMIUM_PLAN_AMOUNTS,
  MEMBERSHIP_PLANS,
} from "../../constants/membershipPlans.js";

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

const resolveUserByUid = async (userUid) => {
  const user = await User.findOne({ uid: userUid }).select("_id uid email name");
  if (!user) {
    throw createError(404, "Authenticated user not found");
  }
  return user;
};

const resolveActivePlan = async (planId) => {
  assertObjectId(planId, "planId");
  const plan = await Plan.findOne({ _id: planId, isActive: true });
  if (!plan) {
    throw createError(404, "Plan not found or inactive");
  }
  return plan;
};

const createPendingSubscription = async ({ userUid, planId }) => {
  const user = await resolveUserByUid(userUid);
  const plan = await resolveActivePlan(planId);

  if (plan.slug === MEMBERSHIP_PLANS.FREE) {
    throw createError(409, "FREE plan does not require a subscription payment");
  }

  if (!ALLOWED_PREMIUM_PLAN_AMOUNTS.includes(Number(plan.price))) {
    throw createError(
      409,
      `Selected plan price is invalid. Allowed amounts are: ${ALLOWED_PREMIUM_PLAN_AMOUNTS.join(", ")} MWK`
    );
  }

  const existingActive = await Subscription.findOne({
    userId: user._id,
    status: SUBSCRIPTION_STATUSES.ACTIVE,
  })
    .populate("planId")
    .populate("paymentId")
    .sort({ endDate: -1 });

  if (existingActive) {
    throw createError(
      409,
      "User already has an active premium subscription"
    );
  }

  const existingPending = await Subscription.findOne({
    userId: user._id,
    planId: plan._id,
    status: SUBSCRIPTION_STATUSES.PENDING,
  })
    .populate("planId")
    .populate("paymentId")
    .sort({ createdAt: -1 });

  if (existingPending) {
    return existingPending;
  }

  const subscription = await Subscription.create({
    userId: user._id,
    planId: plan._id,
    status: SUBSCRIPTION_STATUSES.PENDING,
  });

  return await Subscription.findById(subscription._id)
    .populate("planId")
    .populate("paymentId");
};

const getCurrentSubscriptionForUser = async (userUid) => {
  const user = await resolveUserByUid(userUid);

  const active = await Subscription.findOne({
    userId: user._id,
    status: SUBSCRIPTION_STATUSES.ACTIVE,
  })
    .populate("planId")
    .populate("paymentId")
    .sort({ endDate: -1 });

  if (active) return active;

  return await Subscription.findOne({
    userId: user._id,
    status: SUBSCRIPTION_STATUSES.PENDING,
  })
    .populate("planId")
    .populate("paymentId")
    .sort({ createdAt: -1 });
};

const listSubscriptionsForUser = async (userUid) => {
  const user = await resolveUserByUid(userUid);

  return await Subscription.find({ userId: user._id })
    .populate("planId")
    .populate("paymentId")
    .sort({ createdAt: -1 });
};

const linkPaymentToSubscription = async ({ subscriptionId, paymentId }) => {
  assertObjectId(subscriptionId, "subscriptionId");
  assertObjectId(paymentId, "paymentId");

  return await Subscription.findByIdAndUpdate(
    subscriptionId,
    { paymentId },
    { new: true }
  );
};

const activateSubscriptionForVerifiedPayment = async ({
  subscriptionId,
  paymentId,
  session = null,
}) => {
  assertObjectId(subscriptionId, "subscriptionId");
  assertObjectId(paymentId, "paymentId");

  const query = Subscription.findById(subscriptionId)
    .populate("planId")
    .populate("paymentId");
  if (session) query.session(session);

  const subscription = await query;

  if (!subscription) {
    throw createError(404, "Subscription not found");
  }

  if (!subscription.planId) {
    throw createError(409, "Subscription plan is missing");
  }

  if (
    subscription.status === SUBSCRIPTION_STATUSES.ACTIVE &&
    String(subscription.paymentId?._id || subscription.paymentId || "") ===
      String(paymentId)
  ) {
    return subscription;
  }

  const conflictingQuery = Subscription.findOne({
    userId: subscription.userId,
    status: SUBSCRIPTION_STATUSES.ACTIVE,
    _id: { $ne: subscription._id },
  });
  if (session) conflictingQuery.session(session);
  const conflictingActive = await conflictingQuery;

  if (conflictingActive) {
    throw createError(
      409,
      "User already has another active premium subscription"
    );
  }

  const now = new Date();
  const durationDays = Number(subscription.planId.durationDays || 0);
  const endDate =
    durationDays > 0
      ? new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000)
      : now;

  subscription.status = SUBSCRIPTION_STATUSES.ACTIVE;
  subscription.startDate = subscription.startDate || now;
  subscription.activatedAt = subscription.activatedAt || now;
  subscription.endDate = endDate;
  subscription.expiredAt = null;
  subscription.autoDowngraded = false;
  subscription.paymentId = paymentId;

  await subscription.save(session ? { session } : undefined);

  const hydratedQuery = Subscription.findById(subscription._id)
    .populate("planId")
    .populate("paymentId");
  if (session) hydratedQuery.session(session);

  return await hydratedQuery;
};

export default {
  createPendingSubscription,
  getCurrentSubscriptionForUser,
  listSubscriptionsForUser,
  linkPaymentToSubscription,
  activateSubscriptionForVerifiedPayment,
};
