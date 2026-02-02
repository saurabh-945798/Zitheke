// src/routes/phoneAuth.routes.js
import { Router } from "express";
import { validate } from "../middlewares/validate.js";
import { smsLimiter } from "../middlewares/rateLimit.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import {
  sendOtpSchema,
  verifyOtpSchema,
} from "../schemas/otp.schema.js";
import { PhoneAuthController } from "../Controllers/phoneAuth.controller.js";

const router = Router();

// Only for authenticated phone change flow
router.post(
  "/change-request",
  authMiddleware,
  smsLimiter,
  validate(sendOtpSchema, "body"),
  PhoneAuthController.sendChangeOtp
);

router.post(
  "/change-verify",
  authMiddleware,
  smsLimiter,
  validate(verifyOtpSchema, "body"),
  PhoneAuthController.verifyChangeOtp
);

export default router;
