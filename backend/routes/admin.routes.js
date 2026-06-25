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
  reconcilePendingPayments,
} from "../Controllers/adminSubscriptionAnalyticsController.js";
import {
  getAllContactMessages,
  markMessageAsRead,
  deleteContactMessage,
} from "../Controllers/contactController.js";
import {
  listAdminCategories,
  createAdminCategory,
  updateAdminCategory,
  updateAdminCategoryStatus,
  addAdminSubcategory,
  updateAdminSubcategory,
  updateAdminSubcategoryStatus,
  deleteAdminCategory,
  deleteAdminSubcategory,
} from "../Controllers/categoryController.js";
import {
  categoryIdParamSchema,
  subcategoryIdParamSchema,
  listCategoriesQuerySchema,
  createCategorySchema,
  updateCategorySchema,
  categoryStatusSchema,
  createSubcategorySchema,
  updateSubcategorySchema,
  subcategoryStatusSchema,
} from "../schemas/category.schema.js";

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
router.post(
  "/subscription-analytics/reconcile-pending-payments",
  adminAuthMiddleware,
  reconcilePendingPayments
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
   ADMIN CONTACT INBOX
====================== */
router.get("/contact/messages", adminAuthMiddleware, getAllContactMessages);
router.put(
  "/contact/messages/:id/read",
  adminAuthMiddleware,
  markMessageAsRead
);
router.delete(
  "/contact/messages/:id",
  adminAuthMiddleware,
  deleteContactMessage
);

/* ======================
   ADMIN CATEGORIES
====================== */
router.get(
  "/categories",
  adminAuthMiddleware,
  validate(listCategoriesQuerySchema, "query"),
  listAdminCategories
);
router.post(
  "/categories",
  adminAuthMiddleware,
  validate(createCategorySchema, "body"),
  createAdminCategory
);
router.put(
  "/categories/:categoryId",
  adminAuthMiddleware,
  validate(categoryIdParamSchema, "params"),
  validate(updateCategorySchema, "body"),
  updateAdminCategory
);
router.patch(
  "/categories/:categoryId/status",
  adminAuthMiddleware,
  validate(categoryIdParamSchema, "params"),
  validate(categoryStatusSchema, "body"),
  updateAdminCategoryStatus
);
router.post(
  "/categories/:categoryId/subcategories",
  adminAuthMiddleware,
  validate(categoryIdParamSchema, "params"),
  validate(createSubcategorySchema, "body"),
  addAdminSubcategory
);
router.put(
  "/categories/:categoryId/subcategories/:subcategoryId",
  adminAuthMiddleware,
  validate(subcategoryIdParamSchema, "params"),
  validate(updateSubcategorySchema, "body"),
  updateAdminSubcategory
);
router.patch(
  "/categories/:categoryId/subcategories/:subcategoryId/status",
  adminAuthMiddleware,
  validate(subcategoryIdParamSchema, "params"),
  validate(subcategoryStatusSchema, "body"),
  updateAdminSubcategoryStatus
);
router.delete(
  "/categories/:categoryId",
  adminAuthMiddleware,
  validate(categoryIdParamSchema, "params"),
  deleteAdminCategory
);
router.delete(
  "/categories/:categoryId/subcategories/:subcategoryId",
  adminAuthMiddleware,
  validate(subcategoryIdParamSchema, "params"),
  deleteAdminSubcategory
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
