// src/controllers/phoneAuth.controller.js
import crypto from "crypto";
import jwt from "jsonwebtoken";
import PhoneOtp from "../models/PhoneOtp.js";
import User from "../models/User.js";
import PhoneSignupToken from "../models/PhoneSignupToken.js";
import { SmsService } from "../Services/sms.service.js";
import { env } from "../config/env.js";
import { normalizeMalawiPhone, isValidMalawiPhone } from "../utils/phone.js";
import { createSessionAndTokens } from "../Services/authTokens.service.js";

const OTP_TTL_MINUTES = 5;
const MAX_ATTEMPTS = 5;

const normalizePhone = (raw = "") => normalizeMalawiPhone(raw);
const isValidPhone = (phone) => isValidMalawiPhone(phone);

const hashOtp = (otp) =>
  crypto.createHash("sha256").update(String(otp)).digest("hex");
const hashToken = (token) =>
  crypto.createHash("sha256").update(String(token)).digest("hex");

const verifyTurnstile = async ({ token, ip }) => {
  if (env.NODE_ENV !== "production") return true;
  if (!env.TURNSTILE_SECRET_KEY) return false;
  if (!token) return false;

  const params = new URLSearchParams();
  params.append("secret", env.TURNSTILE_SECRET_KEY);
  params.append("response", token);
  if (ip) params.append("remoteip", ip);

  const resp = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    }
  );
  const data = await resp.json();
  return data?.success === true;
};

export const PhoneAuthController = {
  async sendOtp(req, res) {
    try {
      const { phone, captchaToken } = req.validated?.body || {};
      const normalizedPhone = normalizePhone(phone);

      if (!isValidPhone(normalizedPhone)) {
        return res.status(400).json({
          success: false,
          message: "Use phone number with country code like +265XXXXXXXXX",
        });
      }

      const captchaOk = await verifyTurnstile({
        token: captchaToken,
        ip: req.ip,
      });
      if (!captchaOk) {
        return res.status(400).json({
          success: false,
          message: "Captcha verification failed",
        });
      }

      const existing = await PhoneOtp.findOne({
        phone: normalizedPhone,
        purpose: "login",
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
        codeHash: hashOtp(otp),
        purpose: "login",
        expiresAt,
      });

      await SmsService.sendOtp({
        to: normalizedPhone.replace(/^\+/, ""),
        otp,
        minutes: OTP_TTL_MINUTES,
      });

      return res.status(200).json({
        success: true,
        message: "OTP sent",
        phone: normalizedPhone,
        expiresInMinutes: OTP_TTL_MINUTES,
      });
    } catch (err) {
      const status = err?.status || 500;
      return res.status(status).json({
        success: false,
        message: err?.message || "Failed to send OTP",
        provider: err?.provider || "unknown",
        details: err?.details || null,
      });
    }
  },

  async verifyOtp(req, res) {
    try {
      const { phone, otp } = req.validated?.body || {};
      const normalizedPhone = normalizePhone(phone);

      if (!isValidPhone(normalizedPhone)) {
        return res.status(400).json({
          success: false,
          message: "Use phone number with country code like +265XXXXXXXXX",
        });
      }

      const record = await PhoneOtp.findOne({
        phone: normalizedPhone,
        purpose: "login",
      });
      if (!record) {
        return res.status(400).json({
          success: false,
          message: "OTP not found or expired",
        });
      }

      if (record.expiresAt < new Date()) {
        await PhoneOtp.deleteOne({ _id: record._id });
        return res.status(400).json({
          success: false,
          message: "OTP expired",
        });
      }

      const matches = record.codeHash === hashOtp(otp);
      if (!matches) {
        record.attempts += 1;
        await record.save();

        if (record.attempts >= MAX_ATTEMPTS) {
          await PhoneOtp.deleteOne({ _id: record._id });
        }

        return res.status(400).json({
          success: false,
          message: "Invalid OTP",
        });
      }

      await PhoneOtp.deleteOne({ _id: record._id });

      const user =
        (await User.findOne({ phone: normalizedPhone })) ||
        (await User.findOne({ phone: `+${normalizedPhone}` }));
      if (!user) {
        const signupToken = jwt.sign(
          { phone: normalizedPhone, purpose: "phone_signup" },
          env.JWT_SECRET,
          { expiresIn: "10m" }
        );
        await PhoneSignupToken.deleteMany({ phone: normalizedPhone });
        await PhoneSignupToken.create({
          phone: normalizedPhone,
          tokenHash: hashToken(signupToken),
          expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        });
        return res.status(200).json({
          success: true,
          phone: normalizedPhone,
          requiresSignup: true,
          signupToken,
        });
      }

      const { accessToken, refreshToken, sessionId } =
        await createSessionAndTokens(user, req);

      return res.status(200).json({
        success: true,
        phone: normalizedPhone,
        token: accessToken,
        refreshToken,
        sessionId,
        user,
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: err?.message || "OTP verification failed",
      });
    }
  },

  async sendChangeOtp(req, res) {
    try {
      const { phone, captchaToken } = req.validated?.body || {};
      const normalizedPhone = normalizePhone(phone);

      if (!isValidPhone(normalizedPhone)) {
        return res.status(400).json({
          success: false,
          message: "Use phone number with country code like +265XXXXXXXXX",
        });
      }

      const captchaOk = await verifyTurnstile({
        token: captchaToken,
        ip: req.ip,
      });
      if (!captchaOk) {
        return res.status(400).json({
          success: false,
          message: "Captcha verification failed",
        });
      }

      const existing = await PhoneOtp.findOne({
        phone: normalizedPhone,
        purpose: "change",
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
        codeHash: hashOtp(otp),
        purpose: "change",
        expiresAt,
      });

      await SmsService.sendOtp({
        to: normalizedPhone.replace(/^\+/, ""),
        otp,
        minutes: OTP_TTL_MINUTES,
      });

      return res.status(200).json({
        success: true,
        message: "OTP sent",
        phone: normalizedPhone,
        expiresInMinutes: OTP_TTL_MINUTES,
      });
    } catch (err) {
      const status = err?.status || 500;
      return res.status(status).json({
        success: false,
        message: err?.message || "Failed to send OTP",
        provider: err?.provider || "unknown",
        details: err?.details || null,
      });
    }
  },

  async verifyChangeOtp(req, res) {
    try {
      const { phone, otp } = req.validated?.body || {};
      const normalizedPhone = normalizePhone(phone);

      if (!isValidPhone(normalizedPhone)) {
        return res.status(400).json({
          success: false,
          message: "Use phone number with country code like +265XXXXXXXXX",
        });
      }

      const record = await PhoneOtp.findOne({
        phone: normalizedPhone,
        purpose: "change",
      });
      if (!record) {
        return res.status(400).json({
          success: false,
          message: "OTP not found or expired",
        });
      }

      if (record.expiresAt < new Date()) {
        await PhoneOtp.deleteOne({ _id: record._id });
        return res.status(400).json({
          success: false,
          message: "OTP expired",
        });
      }

      const matches = record.codeHash === hashOtp(otp);
      if (!matches) {
        record.attempts += 1;
        await record.save();

        if (record.attempts >= MAX_ATTEMPTS) {
          await PhoneOtp.deleteOne({ _id: record._id });
        }

        return res.status(400).json({
          success: false,
          message: "Invalid OTP",
        });
      }

      await PhoneOtp.deleteOne({ _id: record._id });

      const uid = req.user?.uid;
      if (!uid) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const user = await User.findOne({ uid });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      user.phone = normalizedPhone;
      user.phoneVerified = true;
      await user.save();

      return res.status(200).json({
        success: true,
        message: "Phone verified",
        phone: normalizedPhone,
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: err?.message || "OTP verification failed",
      });
    }
  },
};


