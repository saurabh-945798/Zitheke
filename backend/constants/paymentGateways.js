export const PAYMENT_GATEWAYS = Object.freeze({
  AIRTEL_MONEY: "airtel_money",
  BANK: "bank",
  STRIPE: "stripe",
  CARD: "card",
  OTHER: "other",
});

export const PAYMENT_GATEWAY_VALUES = Object.freeze(
  Object.values(PAYMENT_GATEWAYS)
);
