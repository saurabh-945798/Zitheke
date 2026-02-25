// src/config/env.js
import dotenv from "dotenv";

// Load .env before accessing process.env
dotenv.config();

/**
 * Centralized env access + safety checks
 * - Secrets must be in backend .env only
 * - Frontend should never receive backend secrets
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

const NODE_ENV = optional("NODE_ENV", "development");
const IS_PRODUCTION = NODE_ENV === "production";

const normalizeBaseUrl = (urlValue) => {
  const trimmed = String(urlValue || "").trim().replace(/\/+$/, "");
  let parsed;
  try {
    parsed = new URL(trimmed);
  } catch {
    throw new Error(`Invalid APP_BASE_URL: ${trimmed}`);
  }
  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error(`Invalid APP_BASE_URL protocol: ${parsed.protocol}`);
  }
  return parsed.toString().replace(/\/+$/, "");
};

/**
 * Production-safe base URL:
 * - Prefer APP_BASE_URL when provided
 * - If missing in production: do NOT crash the server
 *   -> fallback to "https://<PRIMARY_DOMAIN>" if configured
 *   -> else fallback to empty string, and compute dynamically per request
 */
const resolveAppBaseUrl = () => {
  const configured = optional("APP_BASE_URL", "");
  if (configured) return normalizeBaseUrl(configured);

  // Optional: allow a primary domain fallback (recommended)
  const primaryDomain = optional("PRIMARY_DOMAIN", "");
  if (primaryDomain) {
    return normalizeBaseUrl(`https://${primaryDomain}`);
  }

  if (IS_PRODUCTION) {
    // Do not crash production; warn instead.
    console.warn(
      "⚠️ APP_BASE_URL is missing in production. Falling back to dynamic host-based URL. " +
        "Recommended: set APP_BASE_URL=https://zitheke.com in backend .env"
    );
    return ""; // means: compute from request host when needed
  }

  return "http://localhost:5173";
};

export const env = {
  NODE_ENV,
  IS_PRODUCTION,

  // JWT
  JWT_SECRET: required("JWT_SECRET"),
  JWT_REFRESH_SECRET: optional("JWT_REFRESH_SECRET", optional("JWT_SECRET")),

  // Infobip
  INFOBIP_BASE_URL: required("INFOBIP_BASE_URL").replace(/\/+$/, ""),
  INFOBIP_API_KEY: required("INFOBIP_API_KEY"),

  // Email
  INFOBIP_EMAIL_SENDER: required("INFOBIP_EMAIL_SENDER"),
  INFOBIP_EMAIL_REPLY: optional("INFOBIP_EMAIL_REPLY", ""),

  // SMS / OTP
  OTP_SENDER: required("OTP_SENDER"),
  BRAND_SENDER: optional("BRAND_SENDER", optional("INFOBIP_SMS_SENDER", "")),
  OTP_ALLOWED_COUNTRY_CODE: optional("OTP_ALLOWED_COUNTRY_CODE", "265"),

  // App
  APP_NAME: optional("APP_NAME", "App"),
  APP_BASE_URL: resolveAppBaseUrl(),
  PRIMARY_DOMAIN: optional("PRIMARY_DOMAIN", ""),

  // Internal email protection
  INTERNAL_EMAIL_KEY: optional("INTERNAL_EMAIL_KEY", ""),

  // CAPTCHA (Turnstile)
  TURNSTILE_SECRET_KEY: optional("TURNSTILE_SECRET_KEY", ""),
};

/**
 * Helper: get a usable base URL per request (for production when APP_BASE_URL is empty)
 * Use this wherever you need absolute URLs in controllers (email links, redirects, etc.)
 */
export const getRequestBaseUrl = (req) => {
  // If APP_BASE_URL is explicitly set, always use it.
  if (env.APP_BASE_URL) return env.APP_BASE_URL;

  // Otherwise derive from request
  const proto =
    (req.headers["x-forwarded-proto"] || "").toString().split(",")[0].trim() ||
    "https";
  const host =
    (req.headers["x-forwarded-host"] || "").toString().split(",")[0].trim() ||
    (req.headers.host || "").toString().trim();

  if (!host) return "";

  // normalize
  return `${proto}://${host}`.replace(/\/+$/, "");
};