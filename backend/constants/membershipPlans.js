export const MEMBERSHIP_PLANS = Object.freeze({
  FREE: "free",
  BASIC: "basic",
  ESSENTIALS: "essentials",
  PLUS: "plus",
  ADVANCED: "advanced",
});

export const MEMBERSHIP_PLAN_VALUES = Object.freeze(
  Object.values(MEMBERSHIP_PLANS)
);

const PRODUCTION_PREMIUM_PLAN_AMOUNTS = [3000, 5000, 7000, 10000];
// TEMP MPGS TEST PRICING - revert after card testing
const TEMP_MPGS_TEST_PREMIUM_PLAN_AMOUNTS = [50, 100, 150];

export const ALLOWED_PREMIUM_PLAN_AMOUNTS = Object.freeze([
  ...PRODUCTION_PREMIUM_PLAN_AMOUNTS,
  ...TEMP_MPGS_TEST_PREMIUM_PLAN_AMOUNTS,
]);

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
    name: "Simple Start",
    slug: MEMBERSHIP_PLANS.BASIC,
    price: 3000,
    currency: "MWK",
    durationDays: 7,
    features: [
      "Basic ad boost",
      "Standard visibility",
      "Email support",
    ],
    isActive: true,
    priorityLevel: 1,
  },
  {
    name: "Essentials",
    slug: MEMBERSHIP_PLANS.ESSENTIALS,
    price: 5000,
    currency: "MWK",
    durationDays: 14,
    features: [
      "Higher ad ranking",
      "Boost badge",
      "Priority email support",
    ],
    isActive: true,
    priorityLevel: 2,
  },
  {
    name: "Plus",
    slug: MEMBERSHIP_PLANS.PLUS,
    price: 7000,
    currency: "MWK",
    durationDays: 21,
    features: [
      "Top search placement",
      "Featured badge",
      "Up to 5x more views",
      "Priority buyer exposure",
    ],
    isActive: true,
    priorityLevel: 3,
  },
  {
    name: "Advanced",
    slug: MEMBERSHIP_PLANS.ADVANCED,
    price: 10000,
    currency: "MWK",
    durationDays: 28,
    features: [
      "Maximum visibility",
      "Premium featured badge",
      "Top placement across categories",
      "Dedicated support",
    ],
    isActive: true,
    priorityLevel: 4,
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
