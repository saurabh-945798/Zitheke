// src/config/env.js
import dotenv from "dotenv";

// Ensure .env is loaded before any required env access
dotenv.config();

/**
 * Centralized env access + safety checks
 * Keep secrets in .env only (never frontend)
 */

const required = (key) => {
  const v = process.env[key];
  if (!v || !String(v).trim()) {
    throw new Error(`Missing required env: ${key}`);
  }
  return String(v).trim();
};

const optional = (key, fallback = "") => {
  const v = process.env[key];
  if (!v || !String(v).trim()) return fallback;
  return String(v).trim();
};

export const env = {
  NODE_ENV: optional("NODE_ENV", "development"),
  JWT_SECRET: required("JWT_SECRET"),
  JWT_REFRESH_SECRET: optional("JWT_REFRESH_SECRET", optional("JWT_SECRET")),

  INFOBIP_BASE_URL: required("INFOBIP_BASE_URL").replace(/\/+$/, ""),
  INFOBIP_API_KEY: required("INFOBIP_API_KEY"),

  INFOBIP_EMAIL_SENDER: required("INFOBIP_EMAIL_SENDER"),
  INFOBIP_EMAIL_REPLY: optional("INFOBIP_EMAIL_REPLY", ""),
  // Malawi OTP reliability: use numeric sender for authentication OTP traffic.
  OTP_SENDER: required("OTP_SENDER"),
  // Brand/alphanumeric sender is allowed for non-OTP notifications only.
  BRAND_SENDER: optional("BRAND_SENDER", optional("INFOBIP_SMS_SENDER", "")),
  OTP_ALLOWED_COUNTRY_CODE: optional("OTP_ALLOWED_COUNTRY_CODE", "265"),

  APP_NAME: optional("APP_NAME", "App"),
  APP_BASE_URL: optional("APP_BASE_URL", "http://localhost:5173"),

  // If set, email routes require: header "x-internal-email-key"
  INTERNAL_EMAIL_KEY: optional("INTERNAL_EMAIL_KEY", ""),

  // Optional CAPTCHA (Cloudflare Turnstile)
  TURNSTILE_SECRET_KEY: optional("TURNSTILE_SECRET_KEY", ""),
};
