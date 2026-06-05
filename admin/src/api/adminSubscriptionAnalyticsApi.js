import adminApi from "./adminApi";

export const getSubscriptionAnalyticsSummary = async () => {
  const { data } = await adminApi.get("/subscription-analytics/summary");
  return data?.data || null;
};

export const getSubscriptionAnalyticsPlans = async () => {
  const { data } = await adminApi.get("/subscription-analytics/plans");
  return Array.isArray(data?.data) ? data.data : [];
};

export const getSubscriptionAnalyticsSubscriptions = async (params = {}) => {
  const { data } = await adminApi.get("/subscription-analytics/subscriptions", {
    params,
  });

  return {
    items: Array.isArray(data?.data) ? data.data : [],
    pagination: data?.pagination || {
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 1,
    },
  };
};

export const getSubscriptionAnalyticsPayments = async (params = {}) => {
  const { data } = await adminApi.get("/subscription-analytics/payments", {
    params,
  });

  return {
    items: Array.isArray(data?.data) ? data.data : [],
    pagination: data?.pagination || {
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 1,
    },
  };
};
