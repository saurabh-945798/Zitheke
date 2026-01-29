import express from "express";

// 🔐 AUTH MIDDLEWARE
import authMiddleware from "../middlewares/authMiddleware.js";

// 👤 CONTROLLERS
import {
  registerUser,
  registerUserByPhone,
  getUserProfile,
  updateUserProfile,
  logoutUser,
} from "../Controllers/userController.js";

const router = express.Router();

/* =====================================================
   🧾 REGISTER / SYNC USER (PUBLIC)
   ❌ authMiddleware YAHAN NAHI AAYEGA
===================================================== */
router.post(
  "/register",
  registerUser
);

router.post(
  "/phone-register",
  registerUserByPhone
);

/* =====================================================
   dY` LOGOUT USER (PUBLIC)
===================================================== */
router.post(
  "/logout",
  logoutUser
);

/* =====================================================
   👤 GET USER PROFILE (PRIVATE)
===================================================== */
router.get(
  "/:uid",
  authMiddleware,
  getUserProfile
);

/* =====================================================
   ✏️ UPDATE USER PROFILE (PRIVATE)
===================================================== */
router.put(
  "/:uid",
  authMiddleware,
  updateUserProfile
);

export default router;
