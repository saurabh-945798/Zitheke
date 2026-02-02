import express from "express";
import adminAuthMiddleware from "../middlewares/adminAuthMiddleware.js";

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
} from "../Controllers/adminController.js";

import { getAdminStats } from "../Controllers/adminOverview.controller.js";

const router = express.Router();

/* ======================
   ADMIN OVERVIEW
====================== */
router.get("/overview", adminAuthMiddleware, getAdminStats);

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
router.patch("/ads/:id/approve", adminAuthMiddleware, approveAd);
router.patch("/ads/:id/reject", adminAuthMiddleware, rejectAd);
router.delete("/ads/:id", adminAuthMiddleware, deleteAdByAdmin);

export default router;
