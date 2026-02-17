// Controllers/settings.controller.js
import bcrypt from "bcrypt";
import crypto from "crypto";
import User from "../models/User.js";
import UserActionToken from "../models/UserActionToken.js";
import PhoneOtp from "../models/PhoneOtp.js";
import Ad from "../models/Ad.js";
import Session from "../models/Session.js";
import { SmsService } from "../Services/sms.service.js";
import { EmailService } from "../Services/email.service.js";
import { normalizeMalawiPhone, isValidMalawiPhone } from "../utils/phone.js";
import { env } from "../config/env.js";

const OTP_TTL_MINUTES = 10;

const hashToken = (token) =>
  crypto.createHash("sha256").update(String(token)).digest("hex");

const createActionToken = async ({ userId, purpose, minutes = 30, meta = {} }) => {
  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + minutes * 60 * 1000);

  await UserActionToken.create({
    userId,
    purpose,
    tokenHash,
    expiresAt,
    meta,
  });

  return token;
};

const getAppBaseUrl = () => env.APP_BASE_URL || "http://localhost:5173";

const hasPasswordAuth = (user) => {
  const providers = Array.isArray(user.authProviders) ? user.authProviders : [];
  if (providers.includes("password")) return true;
  return user.authProvider === "password";
};

export const SettingsController = {
  async getSettings(req, res) {
    const uid = req.user?.uid;
    const user = await User.findOne({ uid });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const providers = Array.isArray(user.authProviders)
      ? user.authProviders
      : user.authProvider
      ? [user.authProvider]
      : [];

    return res.status(200).json({
      success: true,
      user: {
        uid: user.uid,
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
        authProviders: providers,
        createdAt: user.createdAt,
      },
    });
  },

  async sendEmailVerification(req, res) {
    const uid = req.user?.uid;
    const user = await User.findOne({ uid });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    if (user.emailVerified) {
      return res.status(200).json({ success: true, message: "Email already verified" });
    }
    if (!user.email) {
      return res.status(400).json({ success: false, message: "User email is missing" });
    }

    const token = await createActionToken({
      userId: user._id,
      purpose: "email_verify",
      minutes: 60,
    });

    const verifyLink = `${getAppBaseUrl()}/verify-email?token=${token}`;

    try {
      await EmailService.sendTemplate({
        to: user.email,
        template: "EMAIL_VERIFY",
        data: { name: user.name || user.email, verifyLink },
      });
    } catch (err) {
      return res.status(err?.status || 502).json({
        success: false,
        message: "Email verification send failed",
      });
    }

    return res.status(200).json({ success: true, message: "Verification email sent" });
  },

  async verifyEmail(req, res) {
    const { token } = req.body || {};
    if (!token) {
      return res.status(400).json({ success: false, message: "Token is required" });
    }

    const tokenHash = hashToken(token);
    const record = await UserActionToken.findOne({
      tokenHash,
      purpose: "email_verify",
      usedAt: null,
      expiresAt: { $gt: new Date() },
    });

    if (!record) {
      return res.status(400).json({ success: false, message: "Invalid or expired token" });
    }

    const user = await User.findById(record.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.emailVerified = true;
    await user.save();
    record.usedAt = new Date();
    await record.save();

    return res.status(200).json({ success: true, message: "Email verified" });
  },

  async sendPhoneOtp(req, res) {
    const uid = req.user?.uid;
    const user = await User.findOne({ uid });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const normalizedPhone = normalizeMalawiPhone(user.phone || "");
    if (!normalizedPhone || !isValidMalawiPhone(normalizedPhone)) {
      return res.status(400).json({
        success: false,
        message: "Use phone number with country code like +265XXXXXXXXX",
      });
    }

    const existing = await PhoneOtp.findOne({
      phone: normalizedPhone,
      purpose: "verify_phone",
      expiresAt: { $gt: new Date() },
    });
    if (existing) {
      return res.status(429).json({
        success: false,
        message: "OTP already sent. Please wait before retrying.",
      });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);

    await PhoneOtp.create({
      phone: normalizedPhone,
      codeHash: hashToken(otp),
      purpose: "verify_phone",
      expiresAt,
    });

    await SmsService.sendOtp({
      to: normalizedPhone.replace(/^\+/, ""),
      otp,
    });

    return res.status(200).json({
      success: true,
      message: "OTP sent",
      expiresInMinutes: OTP_TTL_MINUTES,
    });
  },

  async verifyPhoneOtp(req, res) {
    const { otp } = req.body || {};
    const uid = req.user?.uid;
    const user = await User.findOne({ uid });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const normalizedPhone = normalizeMalawiPhone(user.phone || "");
    if (!normalizedPhone || !isValidMalawiPhone(normalizedPhone)) {
      return res.status(400).json({
        success: false,
        message: "Use phone number with country code like +265XXXXXXXXX",
      });
    }

    const record = await PhoneOtp.findOne({
      phone: normalizedPhone,
      purpose: "verify_phone",
    });
    if (!record) {
      return res.status(400).json({ success: false, message: "OTP not found or expired" });
    }

    if (record.expiresAt < new Date()) {
      await PhoneOtp.deleteOne({ _id: record._id });
      return res.status(400).json({ success: false, message: "OTP expired" });
    }

    const matches = record.codeHash === hashToken(otp);
    if (!matches) {
      record.attempts += 1;
      await record.save();
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    await PhoneOtp.deleteOne({ _id: record._id });
    user.phoneVerified = true;
    await user.save();

    return res.status(200).json({ success: true, message: "Phone verified" });
  },

  async requestSetPassword(req, res) {
    const uid = req.user?.uid;
    const user = await User.findOne({ uid });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    if (!user.emailVerified) {
      return res.status(403).json({ success: false, message: "Email verification required" });
    }
    if (hasPasswordAuth(user)) {
      return res.status(400).json({ success: false, message: "Password already set" });
    }
    if (!user.email) {
      return res.status(400).json({ success: false, message: "User email is missing" });
    }

    const token = await createActionToken({
      userId: user._id,
      purpose: "password_set",
      minutes: 30,
    });
    const setLink = `${getAppBaseUrl()}/set-password?token=${token}`;

    try {
      await EmailService.sendTemplate({
        to: user.email,
        template: "PASSWORD_SET",
        data: { name: user.name || user.email, setLink },
      });
    } catch (err) {
      return res.status(err?.status || 502).json({
        success: false,
        message: "Password set email failed",
      });
    }

    return res.status(200).json({ success: true, message: "Password set email sent" });
  },

  async confirmSetPassword(req, res) {
    const { token, password } = req.body || {};
    if (!token || !password) {
      return res.status(400).json({ success: false, message: "Token and password are required" });
    }

    const tokenHash = hashToken(token);
    const record = await UserActionToken.findOne({
      tokenHash,
      purpose: "password_set",
      usedAt: null,
      expiresAt: { $gt: new Date() },
    });

    if (!record) {
      return res.status(400).json({ success: false, message: "Invalid or expired token" });
    }

    const user = await User.findById(record.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (!user.emailVerified) {
      return res.status(403).json({ success: false, message: "Email verification required" });
    }
    if (!user.email) {
      return res.status(400).json({ success: false, message: "User email is missing" });
    }

    user.passwordHash = await bcrypt.hash(password, 10);
    const providers = Array.isArray(user.authProviders) ? user.authProviders : [];
    if (!providers.includes("password")) providers.push("password");
    user.authProviders = providers;
    if (!user.authProvider) user.authProvider = "password";
    await user.save();

    record.usedAt = new Date();
    await record.save();

    return res.status(200).json({ success: true, message: "Password set successfully" });
  },

  async changePassword(req, res) {
    const { currentPassword, newPassword } = req.body || {};
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: "Current and new password are required" });
    }
    const uid = req.user?.uid;
    const user = await User.findOne({ uid });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    if (!user.emailVerified) {
      return res.status(403).json({ success: false, message: "Email verification required" });
    }
    if (!hasPasswordAuth(user)) {
      return res.status(403).json({ success: false, message: "Password login not enabled" });
    }

    const match = await bcrypt.compare(currentPassword, user.passwordHash || "");
    if (!match) {
      return res.status(401).json({ success: false, message: "Invalid current password" });
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();
    return res.status(200).json({ success: true, message: "Password updated" });
  },

  async requestResetPassword(req, res) {
    const uid = req.user?.uid;
    const user = await User.findOne({ uid });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    if (!user.emailVerified) {
      return res.status(403).json({ success: false, message: "Email verification required" });
    }

    const token = await createActionToken({
      userId: user._id,
      purpose: "password_reset",
      minutes: 30,
    });
    const resetLink = `${getAppBaseUrl()}/reset-password?token=${token}`;

    try {
      await EmailService.sendTemplate({
        to: user.email,
        template: "RESET_PASSWORD",
        data: { resetLink },
      });
    } catch (err) {
      return res.status(err?.status || 502).json({
        success: false,
        message: "Password reset email failed",
      });
    }

    return res.status(200).json({ success: true, message: "Password reset email sent" });
  },

  async confirmResetPassword(req, res) {
    const { token, password } = req.body || {};
    if (!token || !password) {
      return res.status(400).json({ success: false, message: "Token and password are required" });
    }

    const tokenHash = hashToken(token);
    const record = await UserActionToken.findOne({
      tokenHash,
      purpose: "password_reset",
      usedAt: null,
      expiresAt: { $gt: new Date() },
    });

    if (!record) {
      return res.status(400).json({ success: false, message: "Invalid or expired token" });
    }

    const user = await User.findById(record.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (!user.emailVerified) {
      return res.status(403).json({ success: false, message: "Email verification required" });
    }
    if (!user.email) {
      return res.status(400).json({ success: false, message: "User email is missing" });
    }

    user.passwordHash = await bcrypt.hash(password, 10);
    const providers = Array.isArray(user.authProviders) ? user.authProviders : [];
    if (!providers.includes("password")) providers.push("password");
    user.authProviders = providers;
    if (!user.authProvider) user.authProvider = "password";
    await user.save();

    record.usedAt = new Date();
    await record.save();

    return res.status(200).json({ success: true, message: "Password reset successfully" });
  },

  async requestDeleteAccount(req, res) {
    const uid = req.user?.uid;
    const user = await User.findOne({ uid });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    if (!user.emailVerified) {
      return res.status(403).json({ success: false, message: "Email verification required" });
    }

    const token = await createActionToken({
      userId: user._id,
      purpose: "delete_account",
      minutes: 30,
    });
    const deleteLink = `${getAppBaseUrl()}/confirm-delete?token=${token}`;

    try {
      await EmailService.sendTemplate({
        to: user.email,
        template: "ACCOUNT_DELETE_CONFIRM",
        data: { name: user.name || user.email, deleteLink },
      });
    } catch (err) {
      return res.status(err?.status || 502).json({
        success: false,
        message: "Account delete email failed",
      });
    }

    return res.status(200).json({ success: true, message: "Delete confirmation email sent" });
  },

  async confirmDeleteAccount(req, res) {
    const { token } = req.body || {};
    if (!token) {
      return res.status(400).json({ success: false, message: "Token is required" });
    }

    const tokenHash = hashToken(token);
    const record = await UserActionToken.findOne({
      tokenHash,
      purpose: "delete_account",
      usedAt: null,
      expiresAt: { $gt: new Date() },
    });
    if (!record) {
      return res.status(400).json({ success: false, message: "Invalid or expired token" });
    }

    const user = await User.findById(record.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    await Session.deleteMany({ userUid: user.uid });
    await Ad.deleteMany({ ownerUid: user.uid });
    await User.deleteOne({ _id: user._id });

    record.usedAt = new Date();
    await record.save();

    return res.status(200).json({ success: true, message: "Account deleted" });
  },
};
