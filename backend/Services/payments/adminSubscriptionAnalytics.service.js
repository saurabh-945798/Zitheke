import mongoose from "mongoose";
import User from "../../models/User.js";
import Plan from "../../models/Plan.js";
import Subscription from "../../models/Subscription.js";
import Payment from "../../models/Payment.js";
import { PAYMENT_STATUSES } from "../../constants/paymentStatuses.js";
import { PAYMENT_VERIFICATION_STATUSES } from "../../constants/paymentVerificationStatuses.js";
import { SUBSCRIPTION_STATUSES } from "../../constants/subscriptionStatuses.js";

const SUCCESSFUL_PAYMENT_STATUSES = [PAYMENT_STATUSES.PAID];
const PENDING_PAYMENT_STATUSES = [
  PAYMENT_STATUSES.CREATED,
  PAYMENT_STATUSES.INITIATED,
  PAYMENT_STATUSES.PENDING,
];
const PENDING_VERIFICATION_FILTER = {
  $or: [
    { status: PAYMENT_STATUSES.PENDING_VERIFICATION },
    {
      verificationStatus: {
        $in: [
          PAYMENT_VERIFICATION_STATUSES.PENDING_VERIFICATION,
          PAYMENT_VERIFICATION_STATUSES.GATEWAY_CONFIGURATION_ERROR,
        ],
      },
    },
  ],
};

const createError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const clampLimit = (value, fallback = 20) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return Math.min(Math.trunc(parsed), 100);
};

const parsePage = (value, fallback = 1) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return Math.trunc(parsed);
};

const escapeRegex = (value = "") =>
  String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const parseObjectId = (value, label) => {
  if (!value) return null;
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw createError(400, `Invalid ${label}`);
  }
  return new mongoose.Types.ObjectId(value);
};

const parseDateRange = ({ startDate, endDate }) => {
  const range = {};

  if (startDate) {
    const parsed = new Date(startDate);
    if (Number.isNaN(parsed.getTime())) {
      throw createError(400, "Invalid startDate");
    }
    range.$gte = parsed;
  }

  if (endDate) {
    const parsed = new Date(endDate);
    if (Number.isNaN(parsed.getTime())) {
      throw createError(400, "Invalid endDate");
    }
    parsed.setHours(23, 59, 59, 999);
    range.$lte = parsed;
  }

  return Object.keys(range).length ? range : null;
};

const getMonthBounds = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return { start, end };
};

const getSummary = async () => {
  const { start, end } = getMonthBounds();

  const [
    totalUsers,
    totalSubscriptions,
    subscribedUsers,
    activeSubscriptions,
    pendingSubscriptions,
    expiredSubscriptions,
    cancelledSubscriptions,
    totalRevenueRows,
    thisMonthRevenueRows,
    successfulPayments,
    pendingPayments,
    failedPayments,
    pendingVerificationPayments,
  ] = await Promise.all([
    User.countDocuments({ role: "user" }),
    Subscription.countDocuments(),
    Subscription.distinct("userId"),
    Subscription.countDocuments({ status: SUBSCRIPTION_STATUSES.ACTIVE }),
    Subscription.countDocuments({ status: SUBSCRIPTION_STATUSES.PENDING }),
    Subscription.countDocuments({ status: SUBSCRIPTION_STATUSES.EXPIRED }),
    Subscription.countDocuments({ status: SUBSCRIPTION_STATUSES.CANCELLED }),
    Payment.aggregate([
      { $match: { status: { $in: SUCCESSFUL_PAYMENT_STATUSES } } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    Payment.aggregate([
      { $match: { status: { $in: SUCCESSFUL_PAYMENT_STATUSES } } },
      {
        $addFields: {
          effectivePaidAt: { $ifNull: ["$paidAt", "$createdAt"] },
        },
      },
      {
        $match: {
          effectivePaidAt: { $gte: start, $lt: end },
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    Payment.countDocuments({ status: { $in: SUCCESSFUL_PAYMENT_STATUSES } }),
    Payment.countDocuments({ status: { $in: PENDING_PAYMENT_STATUSES } }),
    Payment.countDocuments({ status: PAYMENT_STATUSES.FAILED }),
    Payment.countDocuments(PENDING_VERIFICATION_FILTER),
  ]);

  return {
    totalUsers,
    totalSubscriptions,
    totalSubscribedUsers: subscribedUsers.length,
    activeSubscriptions,
    pendingSubscriptions,
    expiredSubscriptions,
    cancelledSubscriptions,
    totalRevenueCollected: Number(totalRevenueRows?.[0]?.total || 0),
    thisMonthRevenue: Number(thisMonthRevenueRows?.[0]?.total || 0),
    successfulPayments,
    pendingPayments,
    failedPayments,
    pendingVerificationPayments,
  };
};

const getPlanAnalytics = async () => {
  const [plans, subscriptionStats, paymentStats] = await Promise.all([
    Plan.find()
      .sort({ priorityLevel: -1, createdAt: 1 })
      .lean(),
    Subscription.aggregate([
      {
        $group: {
          _id: { planId: "$planId", status: "$status" },
          count: { $sum: 1 },
          userIds: { $addToSet: "$userId" },
        },
      },
    ]),
    Payment.aggregate([
      { $match: { status: { $in: SUCCESSFUL_PAYMENT_STATUSES } } },
      {
        $lookup: {
          from: "subscriptions",
          localField: "subscriptionId",
          foreignField: "_id",
          as: "subscription",
        },
      },
      { $unwind: "$subscription" },
      {
        $group: {
          _id: "$subscription.planId",
          successfulPayments: { $sum: 1 },
          revenueCollected: { $sum: "$amount" },
        },
      },
    ]),
  ]);

  const subscriptionMap = new Map();
  for (const row of subscriptionStats) {
    const planId = String(row?._id?.planId || "");
    const status = String(row?._id?.status || "");
    if (!subscriptionMap.has(planId)) {
      subscriptionMap.set(planId, {
        totalSubscriptions: 0,
        activeUsers: 0,
        pendingUsers: 0,
        expiredUsers: 0,
        cancelledUsers: 0,
      });
    }

    const bucket = subscriptionMap.get(planId);
    bucket.totalSubscriptions += Number(row?.count || 0);

    const uniqueUsers = Array.isArray(row?.userIds) ? row.userIds.length : 0;
    if (status === SUBSCRIPTION_STATUSES.ACTIVE) bucket.activeUsers = uniqueUsers;
    if (status === SUBSCRIPTION_STATUSES.PENDING) bucket.pendingUsers = uniqueUsers;
    if (status === SUBSCRIPTION_STATUSES.EXPIRED) bucket.expiredUsers = uniqueUsers;
    if (status === SUBSCRIPTION_STATUSES.CANCELLED) bucket.cancelledUsers = uniqueUsers;
  }

  const paymentMap = new Map(
    paymentStats.map((row) => [
      String(row?._id || ""),
      {
        successfulPayments: Number(row?.successfulPayments || 0),
        revenueCollected: Number(row?.revenueCollected || 0),
      },
    ])
  );

  return plans.map((plan) => {
    const planId = String(plan._id);
    const subscriptionBucket = subscriptionMap.get(planId) || {
      totalSubscriptions: 0,
      activeUsers: 0,
      pendingUsers: 0,
      expiredUsers: 0,
      cancelledUsers: 0,
    };
    const paymentBucket = paymentMap.get(planId) || {
      successfulPayments: 0,
      revenueCollected: 0,
    };

    return {
      planId,
      planName: plan.name,
      planSlug: plan.slug,
      price: Number(plan.price || 0),
      currency: plan.currency || "MWK",
      durationDays: Number(plan.durationDays || 0),
      isActive: Boolean(plan.isActive),
      totalSubscriptions: subscriptionBucket.totalSubscriptions,
      activeUsers: subscriptionBucket.activeUsers,
      pendingUsers: subscriptionBucket.pendingUsers,
      expiredUsers: subscriptionBucket.expiredUsers,
      cancelledUsers: subscriptionBucket.cancelledUsers,
      successfulPayments: paymentBucket.successfulPayments,
      revenueCollected: paymentBucket.revenueCollected,
    };
  });
};

const getSubscriptionAnalytics = async (query = {}) => {
  const page = parsePage(query.page, 1);
  const limit = clampLimit(query.limit, 20);
  const skip = (page - 1) * limit;
  const planId = parseObjectId(query.planId, "planId");
  const createdAtRange = parseDateRange({
    startDate: query.startDate,
    endDate: query.endDate,
  });

  const baseMatch = {};
  if (planId) baseMatch.planId = planId;
  if (query.status) baseMatch.status = String(query.status).trim().toLowerCase();
  if (createdAtRange) baseMatch.createdAt = createdAtRange;

  const search = String(query.search || "").trim();
  const searchRegex = search ? new RegExp(escapeRegex(search), "i") : null;

  const pipeline = [
    { $match: baseMatch },
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "user",
      },
    },
    {
      $lookup: {
        from: "plans",
        localField: "planId",
        foreignField: "_id",
        as: "plan",
      },
    },
    {
      $lookup: {
        from: "payments",
        localField: "paymentId",
        foreignField: "_id",
        as: "payment",
      },
    },
    { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
    { $unwind: { path: "$plan", preserveNullAndEmptyArrays: true } },
    { $unwind: { path: "$payment", preserveNullAndEmptyArrays: true } },
  ];

  if (searchRegex) {
    pipeline.push({
      $match: {
        $or: [
          { "user.name": searchRegex },
          { "user.email": searchRegex },
          { "user.phone": searchRegex },
        ],
      },
    });
  }

  if (query.paymentStatus) {
    pipeline.push({
      $match: { "payment.status": String(query.paymentStatus).trim().toLowerCase() },
    });
  }

  pipeline.push(
    {
      $project: {
        _id: 0,
        subscriptionId: "$_id",
        userId: "$user._id",
        name: "$user.name",
        email: "$user.email",
        phone: "$user.phone",
        planId: "$plan._id",
        planName: "$plan.name",
        planSlug: "$plan.slug",
        subscriptionStatus: "$status",
        paymentStatus: "$payment.status",
        paymentVerificationStatus: "$payment.verificationStatus",
        amountPaid: "$payment.amount",
        currency: "$payment.currency",
        startDate: "$startDate",
        endDate: "$endDate",
        activatedAt: "$activatedAt",
        expiredAt: "$expiredAt",
        paymentId: "$payment._id",
        merchantTransactionId: "$payment.merchantTransactionId",
        gatewayTransactionId: "$payment.gatewayTransactionId",
        createdAt: "$createdAt",
        updatedAt: "$updatedAt",
      },
    },
    { $sort: { createdAt: -1 } },
    {
      $facet: {
        data: [{ $skip: skip }, { $limit: limit }],
        metadata: [{ $count: "total" }],
      },
    }
  );

  const [result] = await Subscription.aggregate(pipeline);
  const total = Number(result?.metadata?.[0]?.total || 0);

  return {
    data: result?.data || [],
    pagination: {
      page,
      limit,
      total,
      totalPages: total > 0 ? Math.ceil(total / limit) : 0,
    },
  };
};

const getPaymentAnalytics = async (query = {}) => {
  const page = parsePage(query.page, 1);
  const limit = clampLimit(query.limit, 20);
  const skip = (page - 1) * limit;
  const createdAtRange = parseDateRange({
    startDate: query.startDate,
    endDate: query.endDate,
  });

  const baseMatch = {};
  if (query.status) baseMatch.status = String(query.status).trim().toLowerCase();
  if (query.verificationStatus) {
    baseMatch.verificationStatus = String(query.verificationStatus)
      .trim()
      .toLowerCase();
  }
  if (query.gateway) baseMatch.gateway = String(query.gateway).trim().toLowerCase();
  if (createdAtRange) baseMatch.createdAt = createdAtRange;

  const search = String(query.search || "").trim();
  const searchRegex = search ? new RegExp(escapeRegex(search), "i") : null;

  const pipeline = [
    { $match: baseMatch },
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "user",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "subscriptionId",
        foreignField: "_id",
        as: "subscription",
      },
    },
    { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
    { $unwind: { path: "$subscription", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "plans",
        localField: "subscription.planId",
        foreignField: "_id",
        as: "plan",
      },
    },
    { $unwind: { path: "$plan", preserveNullAndEmptyArrays: true } },
  ];

  if (searchRegex) {
    pipeline.push({
      $match: {
        $or: [
          { "user.name": searchRegex },
          { "user.email": searchRegex },
          { "user.phone": searchRegex },
          { merchantTransactionId: searchRegex },
          { gatewayTransactionId: searchRegex },
        ],
      },
    });
  }

  pipeline.push(
    {
      $project: {
        _id: 0,
        paymentId: "$_id",
        userId: "$user._id",
        name: "$user.name",
        email: "$user.email",
        phone: "$user.phone",
        subscriptionId: "$subscription._id",
        planId: "$plan._id",
        planName: "$plan.name",
        planSlug: "$plan.slug",
        gateway: "$gateway",
        paymentMethod: "$paymentMethod",
        amount: "$amount",
        currency: "$currency",
        status: "$status",
        verificationStatus: "$verificationStatus",
        merchantTransactionId: "$merchantTransactionId",
        gatewayTransactionId: "$gatewayTransactionId",
        gatewayCode: "$gatewayCode",
        gatewayMessage: "$gatewayMessage",
        failureReason: "$failureReason",
        retryCount: "$retryCount",
        paidAt: "$paidAt",
        createdAt: "$createdAt",
      },
    },
    { $sort: { createdAt: -1 } },
    {
      $facet: {
        data: [{ $skip: skip }, { $limit: limit }],
        metadata: [{ $count: "total" }],
      },
    }
  );

  const [result] = await Payment.aggregate(pipeline);
  const total = Number(result?.metadata?.[0]?.total || 0);

  return {
    data: result?.data || [],
    pagination: {
      page,
      limit,
      total,
      totalPages: total > 0 ? Math.ceil(total / limit) : 0,
    },
  };
};

export default {
  SUCCESSFUL_PAYMENT_STATUSES,
  getSummary,
  getPlanAnalytics,
  getSubscriptionAnalytics,
  getPaymentAnalytics,
};
