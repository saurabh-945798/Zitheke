import express from "express";

import authMiddleware from "../middlewares/authMiddleware.js";
import { emailAuthLimiter } from "../middlewares/rateLimit.js";

import {
  registerUser,
  registerUserByPhone,
  getUserProfile,
  updateUserProfile,
  logoutUser,
} from "../Controllers/userController.js";

const router = express.Router();

router.post("/register", emailAuthLimiter, registerUser);

router.post("/phone-register", registerUserByPhone);

router.post("/logout", logoutUser);

router.get("/:uid", authMiddleware, getUserProfile);

router.put("/:uid", authMiddleware, updateUserProfile);

export default router;
