export const SUBSCRIPTION_STATUSES = Object.freeze({
  PENDING: "pending",
  ACTIVE: "active",
  EXPIRED: "expired",
  CANCELLED: "cancelled",
  FAILED: "failed",
});

export const SUBSCRIPTION_STATUS_VALUES = Object.freeze(
  Object.values(SUBSCRIPTION_STATUSES)
);
