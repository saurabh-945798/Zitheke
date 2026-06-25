import api from "../api/axios";

export const PAYMENT_GATEWAYS = {
  AIRTEL_MONEY: "airtel_money",
  MASTERCARD: "mastercard",
};

export const PAYMENT_METHODS = {
  AIRTEL_MONEY: "airtel_money",
  MASTERCARD: "mastercard",
};

export const listMembershipPlans = async () => {
  const { data } = await api.get("/plans");
  return Array.isArray(data?.plans) ? data.plans : [];
};

export const getPlanBySlug = async (slug) => {
  const { data } = await api.get(`/plans/${slug}`);
  return data?.plan || null;
};

export const getMembershipAccess = async () => {
  const { data } = await api.get("/subscriptions/me/access");
  return data?.access || null;
};

export const createSubscriptionIntent = async (planId) => {
  const { data } = await api.post("/subscriptions", { planId });
  return data?.subscription || null;
};

export const createAirtelPaymentIntent = async ({
  subscriptionId,
  msisdn,
  idempotencyKey,
}) => {
  const { data } = await api.post("/payments", {
    subscriptionId,
    gateway: PAYMENT_GATEWAYS.AIRTEL_MONEY,
    paymentMethod: PAYMENT_METHODS.AIRTEL_MONEY,
    msisdn,
    idempotencyKey,
  });

  return {
    payment: data?.payment || null,
    gateway: data?.gateway || null,
    initiation: data?.initiation || null,
    reused: Boolean(data?.reused),
  };
};

export const createMastercardPaymentIntent = async ({
  subscriptionId,
  idempotencyKey,
}) => {
  const { data } = await api.post("/payments", {
    subscriptionId,
    gateway: PAYMENT_GATEWAYS.MASTERCARD,
    paymentMethod: PAYMENT_METHODS.MASTERCARD,
    idempotencyKey,
  });

  return {
    payment: data?.payment || null,
    gateway: data?.gateway || null,
    initiation: data?.initiation || null,
    reused: Boolean(data?.reused),
  };
};

export const verifyPayment = async (paymentId) => {
  const { data } = await api.post(`/payments/${paymentId}/verify`);
  return {
    payment: data?.payment || null,
    subscription: data?.subscription || null,
    verification: data?.verification || null,
    reused: Boolean(data?.reused),
  };
};

export const featureAd = async (adId) => {
  const { data } = await api.put(`/ads/${adId}/feature`);
  return data;
};

export const unfeatureAd = async (adId) => {
  const { data } = await api.delete(`/ads/${adId}/feature`);
  return data;
};
