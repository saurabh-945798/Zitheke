export const PAYMENT_STATUSES = Object.freeze({
  CREATED: "created",
  INITIATED: "initiated",
  PENDING: "pending",
  PENDING_VERIFICATION: "pending_verification",
  PAID: "paid",
  FAILED: "failed",
  EXPIRED: "expired",
  CANCELLED: "cancelled",
});

export const PAYMENT_STATUS_VALUES = Object.freeze(
  Object.values(PAYMENT_STATUSES)
);
