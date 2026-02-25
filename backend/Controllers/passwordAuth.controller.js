// Controllers/passwordAuth.controller.js
import bcrypt from "bcrypt";
import crypto from "crypto";
import User from "../models/User.js";
import PhoneOtp from "../models/PhoneOtp.js";
import UserActionToken from "../models/UserActionToken.js";
import { SmsService } from "../Services/sms.service.js";
import { createSessionAndTokens } from "../Services/authTokens.service.js";
import { normalizeMalawiPhone, isValidMalawiPhone } from "../utils/phone.js";
import { env } from "../config/env.js";
import { EmailService } from "../Services/email.service.js";
import {
  hashOtp,
  issueOtpRecord,
  markOtpProviderMeta,
  markOtpSendFailed,
} from "../Services/otpRecord.service.js";

const OTP_TTL_MINUTES = 5;
const MAX_ATTEMPTS = 5;
const EMAIL_RESET_OTP_TTL_MINUTES = 10;
const EMAIL_RESET_SESSION_TTL_MINUTES = 15;
const EMAIL_RESET_MAX_ATTEMPTS = 5;

const sanitizeUser = (user) => ({
  uid: user.uid,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  authProvider: user.authProvider,
  phoneVerified: user.phoneVerified,
  emailVerified: user.emailVerified,
  photoURL: user.photoURL || "",
});

const hasPasswordAuth = (user) => {
  const providers = Array.isArray(user.authProviders) ? user.authProviders : [];
  if (providers.includes("password")) return true;
  return user.authProvider === "password";
};

const hashToken = (value) =>
  crypto.createHash("sha256").update(String(value)).digest("hex");

const ensurePasswordProvider = async (user) => {
  const providers = Array.isArray(user.authProviders) ? user.authProviders : [];
  if (!providers.includes("password")) {
    providers.push("password");
    user.authProviders = providers;
    await user.save();
  }
};

const maskSecret = (secret = "") => {
  const s = String(secret || "");
  if (!s) return "(missing)";
  if (s.length <= 8) return "****";
  return `${s.slice(0, 4)}...${s.slice(-4)}`;
};

const verifyTurnstile = async ({ token, ip }) => {
  if (env.NODE_ENV !== "production") {
    return { ok: true, skipped: true, reason: "non-production" };
  }
  if (!env.TURNSTILE_SECRET_KEY) {
    return { ok: false, errorCodes: ["missing-secret-config"] };
  }
  if (!token) {
    return { ok: false, errorCodes: ["missing-input-response"] };
  }

  const params = new URLSearchParams();
  params.append("secret", env.TURNSTILE_SECRET_KEY);
  params.append("response", token);
  if (ip) params.append("remoteip", ip);

  try {
    const resp = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params.toString(),
      }
    );
    const data = await resp.json();
    return {
      ok: data?.success === true,
      errorCodes: Array.isArray(data?.["error-codes"]) ? data["error-codes"] : [],
      raw: data,
      status: resp.status,
    };
  } catch (error) {
    return {
      ok: false,
      errorCodes: ["turnstile-request-failed"],
      raw: { message: error?.message || "request failed" },
      status: 0,
    };
  }
};

export const PasswordAuthController = {
  async signup(req, res) {
    try {
      const { name, email, phone, password } = req.body || {};

      if (!name || !email || !phone || !password) {
        return res.status(400).json({
          success: false,
          message: "All fields are required",
        });
      }

      const normalizedPhone = normalizeMalawiPhone(phone);
      if (!normalizedPhone || !isValidMalawiPhone(normalizedPhone)) {
        return res.status(400).json({
          success: false,
          message: "Use phone number with country code like +265XXXXXXXXX",
        });
      }

      const emailLower = String(email).trim().toLowerCase();

      const existingEmail = await User.findOne({ email: emailLower });
      if (existingEmail) {
        return res.status(409).json({
          success: false,
          message: "Email already registered",
        });
      }

      const existingPhone = await User.findOne({ phone: normalizedPhone });
      if (existingPhone) {
        return res.status(409).json({
          success: false,
          message: "Phone number already registered",
        });
      }

      const passwordHash = await bcrypt.hash(password, 10);

      const user = await User.create({
        uid: `local_${crypto.randomUUID()}`,
        name: String(name).trim(),
        email: emailLower,
        phone: normalizedPhone,
        passwordHash,
        authProvider: "password",
        authProviders: ["password"],
        phoneVerified: false,
        emailVerified: false,
        verified: false,
      });

      try {
        await EmailService.sendTemplate({
          to: user.email,
          template: "WELCOME",
          data: { name: user.name || user.email.split("@")[0] },
        });
      } catch (err) {
        console.error("Welcome email failed:", err?.message || err);
        return res.status(err?.status || 502).json({
          success: false,
          message: "Signup succeeded but welcome email failed",
        });
      }

      return res.status(201).json({
        success: true,
        message: "Signup successful. Please log in.",
        user: sanitizeUser(user),
      });
    } catch (error) {
      console.error("? Signup error:", error);
      return res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  },

  async login(req, res) {
    try {
      const { identifier, password, captchaToken } = req.body || {};

      if (!identifier || !password) {
        return res.status(400).json({
          success: false,
          message: "Email/Phone and password are required",
        });
      }

      const isEmail = String(identifier).includes("@");

      if (isEmail) {
        const emailLower = String(identifier).trim().toLowerCase();
        const user = await User.findOne({ email: emailLower });
        if (!user) {
          return res.status(404).json({
            success: false,
            message: "User not found",
          });
        }

        if (!hasPasswordAuth(user)) {
          return res.status(403).json({
            success: false,
            errorCode: "GOOGLE_ACCOUNT",
            message:
              "This account was created using Google. Please continue with Google Sign-In.",
          });
        }

        const match = await bcrypt.compare(password, user.passwordHash || "");
        if (!match) {
          return res.status(401).json({
            success: false,
            message: "Invalid password",
          });
        }

        user.lastLogin = new Date();
        await user.save();
        await ensurePasswordProvider(user);

        const { accessToken, refreshToken, sessionId } =
          await createSessionAndTokens(user, req);

        return res.status(200).json({
          success: true,
          user: sanitizeUser(user),
          token: accessToken,
          refreshToken,
          sessionId,
        });
      }

      // Phone + password login with OTP
      const normalizedPhone = normalizeMalawiPhone(identifier);
      if (!normalizedPhone || !isValidMalawiPhone(normalizedPhone)) {
        return res.status(400).json({
          success: false,
          message: "Use phone number with country code like +265XXXXXXXXX",
        });
      }

      const user = await User.findOne({ phone: normalizedPhone });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      if (!hasPasswordAuth(user)) {
        return res.status(403).json({
          success: false,
          errorCode: "GOOGLE_ACCOUNT",
          message:
            "This account was created using Google. Please continue with Google Sign-In.",
        });
      }

      const match = await bcrypt.compare(password, user.passwordHash || "");
      if (!match) {
        return res.status(401).json({
          success: false,
          message: "Invalid password",
        });
      }

      await ensurePasswordProvider(user);

      const clientIp =
        req.headers["cf-connecting-ip"] ||
        req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
        req.ip;

      const captchaResult = await verifyTurnstile({
        token: captchaToken,
        ip: clientIp,
      });
      if (!captchaResult.ok) {
        console.error("Turnstile verification failed (password login):", {
          nodeEnv: env.NODE_ENV,
          secret: maskSecret(env.TURNSTILE_SECRET_KEY),
          hasCaptchaToken: Boolean(captchaToken),
          captchaTokenLength: String(captchaToken || "").length,
          clientIp,
          status: captchaResult.status ?? null,
          success: captchaResult.raw?.success ?? false,
          errorCodes: captchaResult.errorCodes || [],
          response: captchaResult.raw || null,
        });
        return res.status(400).json({
          success: false,
          message: "Captcha verification failed",
          errorCodes: captchaResult.errorCodes || [],
        });
      }

      const issued = await issueOtpRecord({
        phone: normalizedPhone,
        purpose: "login_password",
        ttlMinutes: OTP_TTL_MINUTES,
      });
      if (issued.blocked) {
        return res.status(429).json({
          success: false,
          message: "OTP already sent. Please wait before retrying.",
          retryAfterSeconds: issued.retryAfterSeconds,
        });
      }

      try {
        const sms = await SmsService.sendOtp({
          to: normalizedPhone.replace(/^\+/, ""),
          otp: issued.otp,
        });
        const msg = sms?.response?.messages?.[0];
        await markOtpProviderMeta(issued.record?._id, {
          messageId: msg?.messageId || "",
          providerStatus: msg?.status?.name || "",
          providerGroup: msg?.status?.groupName || "",
        });
      } catch (smsErr) {
        await markOtpSendFailed(issued.record?._id, smsErr?.message || "SMS send failed");
        throw smsErr;
      }

      return res.status(200).json({
        success: true,
        otpRequired: true,
        phone: normalizedPhone,
        expiresInMinutes: OTP_TTL_MINUTES,
      });
    } catch (error) {
      console.error("? Login error:", error);
      return res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  },

  async verifyLoginOtp(req, res) {
    try {
      const { phone, otp } = req.body || {};

      const normalizedPhone = normalizeMalawiPhone(phone);
      if (!normalizedPhone || !isValidMalawiPhone(normalizedPhone)) {
        return res.status(400).json({
          success: false,
          message: "Use phone number with country code like +265XXXXXXXXX",
        });
      }

      const record = await PhoneOtp.findOne({
        phone: normalizedPhone,
        purpose: "login_password",
        status: "active",
      }).sort({ createdAt: -1 });
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

      await PhoneOtp.updateMany(
        { phone: normalizedPhone, purpose: "login_password", status: "active" },
        { status: "verified" }
      );

      const user = await User.findOne({ phone: normalizedPhone });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      if (!hasPasswordAuth(user)) {
        return res.status(403).json({
          success: false,
          errorCode: "GOOGLE_ACCOUNT",
          message:
            "This account was created using Google. Please continue with Google Sign-In.",
        });
      }

      user.phoneVerified = true;
      user.lastLogin = new Date();
      await user.save();
      await ensurePasswordProvider(user);

      const { accessToken, refreshToken, sessionId } =
        await createSessionAndTokens(user, req);

      return res.status(200).json({
        success: true,
        user: sanitizeUser(user),
        token: accessToken,
        refreshToken,
        sessionId,
      });
    } catch (error) {
      console.error("? OTP verify error:", error);
      return res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  },

  async requestForgotPasswordOtp(req, res) {
    try {
      const email = String(req.body?.email || "")
        .trim()
        .toLowerCase();

      if (!email || !email.includes("@")) {
        return res.status(400).json({
          success: false,
          message: "Valid email is required",
        });
      }

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(200).json({
          success: true,
          message: "If this email is registered, an OTP has been sent.",
        });
      }

      if (!hasPasswordAuth(user)) {
        return res.status(403).json({
          success: false,
          errorCode: "GOOGLE_ACCOUNT",
          message:
            "This account was created using Google. Please continue with Google Sign-In.",
        });
      }

      const otp = String(crypto.randomInt(100000, 1000000));
      const otpHash = hashToken(otp);
      const expiresAt = new Date(
        Date.now() + EMAIL_RESET_OTP_TTL_MINUTES * 60 * 1000
      );

      await UserActionToken.updateMany(
        { userId: user._id, purpose: "password_reset_otp", usedAt: null },
        { usedAt: new Date() }
      );

      await UserActionToken.create({
        userId: user._id,
        purpose: "password_reset_otp",
        tokenHash: otpHash,
        expiresAt,
        meta: { attempts: 0, email },
      });

      await EmailService.sendTemplate({
        to: user.email,
        template: "OTP",
        data: { otp, minutes: EMAIL_RESET_OTP_TTL_MINUTES },
      });

      return res.status(200).json({
        success: true,
        message: "If this email is registered, an OTP has been sent.",
      });
    } catch (error) {
      console.error("Forgot password OTP request error:", error);
      return res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  },

  async verifyForgotPasswordOtp(req, res) {
    try {
      const email = String(req.body?.email || "")
        .trim()
        .toLowerCase();
      const otp = String(req.body?.otp || "").trim();

      if (!email || !otp) {
        return res.status(400).json({
          success: false,
          message: "Email and OTP are required",
        });
      }

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({
          success: false,
          message: "Invalid or expired OTP",
        });
      }

      const otpRecord = await UserActionToken.findOne({
        userId: user._id,
        purpose: "password_reset_otp",
        usedAt: null,
      }).sort({ createdAt: -1 });

      if (!otpRecord || otpRecord.expiresAt <= new Date()) {
        return res.status(400).json({
          success: false,
          message: "Invalid or expired OTP",
        });
      }

      const providedHash = hashToken(otp);
      if (otpRecord.tokenHash !== providedHash) {
        const attempts = Number(otpRecord?.meta?.attempts || 0) + 1;
        otpRecord.meta = { ...(otpRecord.meta || {}), attempts };
        if (attempts >= EMAIL_RESET_MAX_ATTEMPTS) {
          otpRecord.usedAt = new Date();
        }
        await otpRecord.save();
        return res.status(400).json({
          success: false,
          message: "Wrong OTP. Please try again.",
        });
      }

      otpRecord.usedAt = new Date();
      await otpRecord.save();

      const resetToken = crypto.randomBytes(32).toString("hex");
      const resetTokenHash = hashToken(resetToken);
      const resetExpiresAt = new Date(
        Date.now() + EMAIL_RESET_SESSION_TTL_MINUTES * 60 * 1000
      );

      await UserActionToken.updateMany(
        {
          userId: user._id,
          purpose: "password_reset_otp_session",
          usedAt: null,
        },
        { usedAt: new Date() }
      );

      await UserActionToken.create({
        userId: user._id,
        purpose: "password_reset_otp_session",
        tokenHash: resetTokenHash,
        expiresAt: resetExpiresAt,
        meta: { flow: "forgot_password_otp", email },
      });

      return res.status(200).json({
        success: true,
        message: "OTP verified",
        resetToken,
      });
    } catch (error) {
      console.error("Forgot password OTP verify error:", error);
      return res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  },

  async resetPasswordWithOtp(req, res) {
    try {
      const token = String(req.body?.token || "").trim();
      const password = String(req.body?.password || "");

      if (!token || !password) {
        return res.status(400).json({
          success: false,
          message: "Token and password are required",
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: "Password must be at least 6 characters.",
        });
      }

      const tokenHash = hashToken(token);
      const sessionRecord = await UserActionToken.findOne({
        tokenHash,
        purpose: "password_reset_otp_session",
        usedAt: null,
        expiresAt: { $gt: new Date() },
      });

      if (!sessionRecord) {
        return res.status(400).json({
          success: false,
          message: "Invalid or expired reset session. Please request OTP again.",
        });
      }

      const user = await User.findById(sessionRecord.userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      user.passwordHash = await bcrypt.hash(password, 10);
      const providers = Array.isArray(user.authProviders) ? user.authProviders : [];
      if (!providers.includes("password")) providers.push("password");
      user.authProviders = providers;
      if (!user.authProvider) user.authProvider = "password";
      await user.save();

      sessionRecord.usedAt = new Date();
      await sessionRecord.save();

      return res.status(200).json({
        success: true,
        message: "Password reset successful. Please login.",
      });
    } catch (error) {
      console.error("Forgot password reset error:", error);
      return res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  },
};
