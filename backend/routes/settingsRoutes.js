// routes/settingsRoutes.js
import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import { SettingsController } from "../Controllers/settings.controller.js";

const router = express.Router();

router.get("/me", authMiddleware, SettingsController.getSettings);

router.post("/email/send", authMiddleware, SettingsController.sendEmailVerification);
router.post("/email/verify", SettingsController.verifyEmail);

router.post("/phone/send", authMiddleware, SettingsController.sendPhoneOtp);
router.post("/phone/verify", authMiddleware, SettingsController.verifyPhoneOtp);

router.post("/password/set/request", authMiddleware, SettingsController.requestSetPassword);
router.post("/password/set/confirm", SettingsController.confirmSetPassword);

router.post("/password/change", authMiddleware, SettingsController.changePassword);
router.post("/password/reset/request", authMiddleware, SettingsController.requestResetPassword);
router.post("/password/reset/confirm", SettingsController.confirmResetPassword);

router.post("/delete/request", authMiddleware, SettingsController.requestDeleteAccount);
router.post("/delete/confirm", SettingsController.confirmDeleteAccount);

export default router;
