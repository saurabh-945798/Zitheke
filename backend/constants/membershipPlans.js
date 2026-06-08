export const MEMBERSHIP_PLANS = Object.freeze({
  FREE: "free",
  BASIC: "basic",
  PLUS: "plus",
  ADVANCED: "advanced",
});

export const MEMBERSHIP_PLAN_VALUES = Object.freeze(
  Object.values(MEMBERSHIP_PLANS)
);

export const ALLOWED_PREMIUM_PLAN_AMOUNTS = Object.freeze([3000, 5000, 15000]);

export const MEMBERSHIP_PLAN_DEFINITIONS = Object.freeze([
  {
    name: "FREE",
    slug: MEMBERSHIP_PLANS.FREE,
    price: 0,
    currency: "MWK",
    durationDays: 0,
    features: [
      "Standard account access",
      "Browse and contact sellers",
    ],
    isActive: true,
    priorityLevel: 0,
  },
  {
    name: "BASIC",
    slug: MEMBERSHIP_PLANS.BASIC,
    price: 3000,
    currency: "MWK",
    durationDays: 7,
    features: [
      "Basic premium badge",
      "Improved listing visibility",
    ],
    isActive: true,
    priorityLevel: 1,
  },
  {
    name: "PLUS",
    slug: MEMBERSHIP_PLANS.PLUS,
    price: 5000,
    currency: "MWK",
    durationDays: 14,
    features: [
      "Priority listing placement",
      "Higher marketplace visibility",
    ],
    isActive: true,
    priorityLevel: 2,
  },
  {
    name: "ADVANCED",
    slug: MEMBERSHIP_PLANS.ADVANCED,
    price: 15000,
    currency: "MWK",
    durationDays: 28,
    features: [
      "Top-tier premium badge",
      "Maximum listing priority",
    ],
    isActive: true,
    priorityLevel: 3,
  },
]);

export const MEMBERSHIP_PLAN_BY_SLUG = Object.freeze(
  MEMBERSHIP_PLAN_DEFINITIONS.reduce((acc, plan) => {
    acc[plan.slug] = plan;
    return acc;
  }, {})
);

export const getMembershipPlanDefinition = (slug = MEMBERSHIP_PLANS.FREE) =>
  MEMBERSHIP_PLAN_BY_SLUG[String(slug || "").trim().toLowerCase()] ||
  MEMBERSHIP_PLAN_BY_SLUG[MEMBERSHIP_PLANS.FREE];
