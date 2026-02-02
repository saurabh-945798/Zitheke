import { Router } from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import {
  refreshTokenHandler,
  logoutSession,
  listSessions,
  revokeSession,
  revokeOtherSessions,
} from "../Controllers/authSession.controller.js";
import {
  checkEmailLogin,
  recordEmailLoginFail,
  recordEmailLoginSuccess,
} from "../Controllers/emailLoginGuard.controller.js";
import { PasswordAuthController } from "../Controllers/passwordAuth.controller.js";
import { smsLimiter, emailAuthLimiter } from "../middlewares/rateLimit.js";

const router = Router();

router.post("/refresh", refreshTokenHandler);
router.post("/logout", logoutSession);
router.post("/email-login/check", checkEmailLogin);
router.post("/email-login/fail", recordEmailLoginFail);
router.post("/email-login/success", recordEmailLoginSuccess);

// Strict password auth flow
router.post("/signup", PasswordAuthController.signup);
router.post("/login", emailAuthLimiter, PasswordAuthController.login);
router.post(
  "/login/verify-otp",
  smsLimiter,
  PasswordAuthController.verifyLoginOtp
);

router.get("/sessions", authMiddleware, listSessions);
router.delete("/sessions/:id", authMiddleware, revokeSession);
router.delete("/sessions", authMiddleware, revokeOtherSessions);

export default router;
