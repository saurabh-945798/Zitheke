// Controllers/passwordAuth.controller.js
import bcrypt from "bcrypt";
import crypto from "crypto";
import User from "../models/User.js";
import PhoneOtp from "../models/PhoneOtp.js";
import { SmsService } from "../Services/sms.service.js";
import { createSessionAndTokens } from "../Services/authTokens.service.js";
import { normalizeMalawiPhone, isValidMalawiPhone } from "../utils/phone.js";
import { env } from "../config/env.js";
import { EmailService } from "../Services/email.service.js";

const OTP_TTL_MINUTES = 5;
const MAX_ATTEMPTS = 5;

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

const ensurePasswordProvider = async (user) => {
  const providers = Array.isArray(user.authProviders) ? user.authProviders : [];
  if (!providers.includes("password")) {
    providers.push("password");
    user.authProviders = providers;
    await user.save();
  }
};

const hashOtp = (otp) =>
  crypto.createHash("sha256").update(String(otp)).digest("hex");

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

      EmailService.sendTemplate({
        to: emailLower,
        template: "WELCOME",
        data: { name: String(name).trim() || emailLower.split("@")[0] },
      }).catch((err) => {
        console.error("Welcome email failed:", err?.message || err);
      });

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
        purpose: "login_password",
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
        purpose: "login_password",
        expiresAt,
      });

      await SmsService.sendOtp({
        to: normalizedPhone.replace(/^\+/, ""),
        otp,
        minutes: OTP_TTL_MINUTES,
      });

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
};


