import express from "express";

// 🔐 Middlewares
import adminAuthMiddleware from "../middlewares/adminAuthMiddleware.js";
import roleMiddleware from "../middlewares/roleMiddleware.js";

// 📊 Controller
import { getAdminStats } from "../Controllers/adminAnalyticsController.js";

const router = express.Router();

/* =====================================================
   🔐 ADMIN ACCESS ONLY
===================================================== */
router.use(adminAuthMiddleware, roleMiddleware("admin"));

/* =====================================================
   📊 ADMIN ANALYTICS / OVERVIEW
===================================================== */
router.get("/overview", getAdminStats);

export default router;
