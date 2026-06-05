import express from "express";
import adminAuthMiddleware from "../middlewares/adminAuthMiddleware.js";
import { adUpload } from "../middlewares/localUpload.js";
import multerErrorHandler from "../middlewares/multerErrorHandler.js";
import { validate } from "../middlewares/validate.js";
import {
  createPlanSchema,
  updatePlanSchema,
  planIdParamSchema,
} from "../schemas/plan.schema.js";
import {
  listPlansForAdmin,
  createPlan,
  updatePlan,
  deletePlan,
} from "../Controllers/planController.js";
import { runSubscriptionExpirySync } from "../Controllers/subscriptionController.js";
import {
  getSubscriptionAnalyticsSummary,
  getSubscriptionAnalyticsPlans,
  getSubscriptionAnalyticsSubscriptions,
  getSubscriptionAnalyticsPayments,
} from "../Controllers/adminSubscriptionAnalyticsController.js";

import {
  // 👤 USERS
  getAllUsers,
  getUserDetails,
  banUser,
  unbanUser,

  // 📦 ADS
  getAllAds,
  getAdById,
  approveAd,
  rejectAd,
  deleteAdByAdmin,
  getAdsStats,
  updateAdByAdmin,
  optimizeAdCopyByAdmin,
} from "../Controllers/adminController.js";

import { getAdminStats } from "../Controllers/adminOverview.controller.js";

const router = express.Router();

/* ======================
   ADMIN OVERVIEW
====================== */
router.get("/overview", adminAuthMiddleware, getAdminStats);

/* ======================
   ADMIN PLANS
====================== */
router.get("/plans", adminAuthMiddleware, listPlansForAdmin);
router.post(
  "/plans",
  adminAuthMiddleware,
  validate(createPlanSchema, "body"),
  createPlan
);
router.put(
  "/plans/:id",
  adminAuthMiddleware,
  validate(planIdParamSchema, "params"),
  validate(updatePlanSchema, "body"),
  updatePlan
);
router.delete(
  "/plans/:id",
  adminAuthMiddleware,
  validate(planIdParamSchema, "params"),
  deletePlan
);

/* ======================
   ADMIN SUBSCRIPTION ANALYTICS
====================== */
router.get(
  "/subscription-analytics/summary",
  adminAuthMiddleware,
  getSubscriptionAnalyticsSummary
);
router.get(
  "/subscription-analytics/plans",
  adminAuthMiddleware,
  getSubscriptionAnalyticsPlans
);
router.get(
  "/subscription-analytics/subscriptions",
  adminAuthMiddleware,
  getSubscriptionAnalyticsSubscriptions
);
router.get(
  "/subscription-analytics/payments",
  adminAuthMiddleware,
  getSubscriptionAnalyticsPayments
);

/* ======================
   ADMIN SUBSCRIPTIONS
====================== */
router.post(
  "/subscriptions/expiry-sync",
  adminAuthMiddleware,
  runSubscriptionExpirySync
);

/* ======================
   ADMIN USERS
====================== */
router.get("/users", adminAuthMiddleware, getAllUsers);
router.get("/users/:id", adminAuthMiddleware, getUserDetails);
router.put("/users/:id/ban", adminAuthMiddleware, banUser);
router.put("/users/:id/unban", adminAuthMiddleware, unbanUser);

/* ======================
   ADMIN ADS  🔥 (MISSING PART)
====================== */
router.get("/ads", adminAuthMiddleware, getAllAds);
router.get("/ads/stats/summary", adminAuthMiddleware, getAdsStats);

router.get("/ads/:id", adminAuthMiddleware, getAdById);
router.post("/ads/optimize-copy", adminAuthMiddleware, optimizeAdCopyByAdmin);
router.put("/ads/:id", adminAuthMiddleware, adUpload, multerErrorHandler, updateAdByAdmin);
router.patch("/ads/:id/approve", adminAuthMiddleware, approveAd);
router.patch("/ads/:id/reject", adminAuthMiddleware, rejectAd);
router.delete("/ads/:id", adminAuthMiddleware, deleteAdByAdmin);

export default router;
