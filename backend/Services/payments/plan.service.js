import mongoose from "mongoose";
import Plan from "../../models/Plan.js";
import Subscription from "../../models/Subscription.js";
import {
  ALLOWED_PREMIUM_PLAN_AMOUNTS,
  MEMBERSHIP_PLANS,
} from "../../constants/membershipPlans.js";
import { SUBSCRIPTION_STATUSES } from "../../constants/subscriptionStatuses.js";

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

const listPublicPlans = async () => {
  return await Plan.find({ isActive: true })
    .sort({ priorityLevel: -1, price: 1, durationDays: 1 })
    .lean();
};

const getPlanBySlug = async (slug) => {
  const plan = await Plan.findOne({
    slug: String(slug || "").trim().toLowerCase(),
    isActive: true,
  }).lean();

  if (!plan) {
    throw createError(404, "Plan not found");
  }

  return plan;
};

const getActivePlanById = async (planId) => {
  assertObjectId(planId, "planId");

  const plan = await Plan.findOne({ _id: planId, isActive: true });
  if (!plan) {
    throw createError(404, "Plan not found or inactive");
  }

  return plan;
};

const listAllPlansForAdmin = async () => {
  return await Plan.find()
    .sort({ priorityLevel: -1, createdAt: 1 })
    .lean();
};

const normalizePlanPayload = (payload = {}) => ({
  name: String(payload.name || "").trim(),
  slug: String(payload.slug || "").trim().toLowerCase(),
  price: Number(payload.price),
  currency: String(payload.currency || "MWK").trim().toUpperCase(),
  durationDays: Number(payload.durationDays),
  features: Array.isArray(payload.features)
    ? payload.features.map((feature) => String(feature).trim()).filter(Boolean)
    : [],
  isActive:
    payload.isActive === undefined ? true : Boolean(payload.isActive),
  priorityLevel: Number(payload.priorityLevel ?? 0),
});

const assertUniqueSlug = async (slug, excludeId = null) => {
  const existing = await Plan.findOne({
    slug,
    ...(excludeId ? { _id: { $ne: excludeId } } : {}),
  }).select("_id slug");

  if (existing) {
    throw createError(409, "Plan slug already exists");
  }
};

const assertAllowedPlanPrice = (slug, price) => {
  if (slug === MEMBERSHIP_PLANS.FREE) {
    if (Number(price) !== 0) {
      throw createError(409, "FREE plan price must be 0 MWK");
    }
    return;
  }

  if (!ALLOWED_PREMIUM_PLAN_AMOUNTS.includes(Number(price))) {
    throw createError(
      409,
      `Premium plan price must be one of: ${ALLOWED_PREMIUM_PLAN_AMOUNTS.join(", ")} MWK`
    );
  }
};

const createPlan = async (payload) => {
  const normalized = normalizePlanPayload(payload);
  assertAllowedPlanPrice(normalized.slug, normalized.price);
  await assertUniqueSlug(normalized.slug);
  return await Plan.create(normalized);
};

const updatePlan = async (planId, payload) => {
  assertObjectId(planId, "planId");
  const plan = await Plan.findById(planId);

  if (!plan) {
    throw createError(404, "Plan not found");
  }

  const nextSlug =
    payload.slug === undefined
      ? plan.slug
      : String(payload.slug || "").trim().toLowerCase();

  await assertUniqueSlug(nextSlug, plan._id);
  const nextPrice =
    payload.price === undefined ? Number(plan.price) : Number(payload.price);
  assertAllowedPlanPrice(nextSlug, nextPrice);

  if (payload.name !== undefined) plan.name = String(payload.name).trim();
  if (payload.slug !== undefined) plan.slug = nextSlug;
  if (payload.price !== undefined) plan.price = Number(payload.price);
  if (payload.currency !== undefined) {
    plan.currency = String(payload.currency).trim().toUpperCase();
  }
  if (payload.durationDays !== undefined) {
    plan.durationDays = Number(payload.durationDays);
  }
  if (payload.features !== undefined) {
    plan.features = Array.isArray(payload.features)
      ? payload.features.map((feature) => String(feature).trim()).filter(Boolean)
      : [];
  }
  if (payload.isActive !== undefined) plan.isActive = Boolean(payload.isActive);
  if (payload.priorityLevel !== undefined) {
    plan.priorityLevel = Number(payload.priorityLevel);
  }

  await plan.save();
  return plan;
};

const deletePlan = async (planId) => {
  assertObjectId(planId, "planId");
  const plan = await Plan.findById(planId);

  if (!plan) {
    throw createError(404, "Plan not found");
  }

  if (plan.slug === MEMBERSHIP_PLANS.FREE) {
    throw createError(409, "FREE plan cannot be deleted");
  }

  const activeSubscriptions = await Subscription.exists({
    planId: plan._id,
    status: SUBSCRIPTION_STATUSES.ACTIVE,
  });

  if (activeSubscriptions) {
    throw createError(409, "Cannot delete a plan with active subscriptions");
  }

  await Plan.deleteOne({ _id: plan._id });
  return { deleted: true, id: planId };
};

export default {
  listPublicPlans,
  getPlanBySlug,
  getActivePlanById,
  listAllPlansForAdmin,
  createPlan,
  updatePlan,
  deletePlan,
};
