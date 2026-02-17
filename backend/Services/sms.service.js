// src/services/sms.service.js
import { infobipClient } from "../config/infobip.js";
import { env } from "../config/env.js";
import { buildOtpMessage } from "../config/otpSmsTemplate.js";

const normalizeError = (err) => {
  const status = err?.response?.status || 500;
  const data = err?.response?.data;

  return {
    status,
    message: data?.requestError?.serviceException?.text || err?.message || "SMS send failed",
    provider: "infobip",
    details: data || null,
  };
};

const normalizeTo = (to) => String(to || "").replace(/\D/g, "");

const normalizeToE164 = (raw = "") => {
  const digits = String(raw || "").replace(/\D/g, "");
  if (!digits) return "";

  let local = digits;
  if (local.startsWith(env.OTP_ALLOWED_COUNTRY_CODE)) {
    local = local.slice(env.OTP_ALLOWED_COUNTRY_CODE.length);
  } else if (local.startsWith("0")) {
    local = local.slice(1);
  }

  if (local.length !== 9) return "";
  return `+${env.OTP_ALLOWED_COUNTRY_CODE}${local}`;
};

const toMsisdn = (e164 = "") => String(e164).replace(/\D/g, "");

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const isTemporaryError = (err) => {
  const status = err?.response?.status || 0;
  const code = err?.response?.data?.requestError?.serviceException?.messageId || "";
  return status === 408 || status === 429 || status >= 500 || code === "TOO_MANY_REQUESTS";
};

const logOtpAttempt = (level, payload) => {
  const entry = {
    tsUtc: new Date().toISOString(),
    event: "otp_sms_attempt",
    ...payload,
  };
  if (level === "error") console.error(JSON.stringify(entry));
  else if (level === "warn") console.warn(JSON.stringify(entry));
  else console.info(JSON.stringify(entry));
};

export const SmsService = {
  async sendOtp({ to, otp }) {
    // Malawi carriers can silently block OTP sent from unapproved alphanumeric sender IDs.
    // For authentication OTP, always use numeric sender for best delivery reliability.
    const e164 = normalizeToE164(to);
    if (!e164) {
      const err = new Error("Invalid phone number. Use Malawi format (+265XXXXXXXXX)");
      err.status = 400;
      throw err;
    }
    const normalizedTo = toMsisdn(e164);
    const payload = {
      messages: [
        {
          from: env.OTP_SENDER,
          destinations: [{ to: normalizedTo }],
          // Enforced operator-approved template for OTP traffic.
          text: buildOtpMessage(otp),
        },
      ],
    };

    let lastErr;
    const maxAttempts = 2;
    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      try {
        const res = await infobipClient.post("/sms/2/text/advanced", payload);
        const msg = res?.data?.messages?.[0];
        const messageId = msg?.messageId || null;
        const statusName = msg?.status?.name || null;
        const statusGroup = msg?.status?.groupName || msg?.status?.groupId || null;

        if (messageId || statusName || statusGroup) {
          logOtpAttempt("info", {
            attempt,
            to: normalizedTo,
            sender: env.OTP_SENDER,
            messageId,
            statusName,
            statusGroup,
          });
        } else {
          logOtpAttempt("warn", {
            attempt,
            to: normalizedTo,
            sender: env.OTP_SENDER,
            note: "missing_message_id",
            response: res?.data || null,
          });
        }

        return { provider: "infobip", response: res.data };
      } catch (err) {
        lastErr = err;
        const errorResp = err?.response?.data || null;
        logOtpAttempt("error", {
          attempt,
          to: normalizedTo,
          sender: env.OTP_SENDER,
          statusCode: err?.response?.status || 500,
          error: err?.message || "SMS send failed",
          providerCode:
            errorResp?.requestError?.serviceException?.messageId || null,
          providerText:
            errorResp?.requestError?.serviceException?.text || null,
          response: errorResp,
        });

        if (attempt < maxAttempts && isTemporaryError(err)) {
          await wait(1200 * attempt);
          continue;
        }
        throw normalizeError(err);
      }
    }
    throw normalizeError(lastErr);
  },

  async sendText({ to, text }) {
    const normalizedTo = normalizeTo(to);
    // Brand sender can be used for non-OTP notifications.
    const payload = {
      messages: [
        {
          from: env.BRAND_SENDER || env.OTP_SENDER,
          destinations: [{ to: normalizedTo }],
          text,
        },
      ],
    };

    try {
      const res = await infobipClient.post("/sms/2/text/advanced", payload);
      const msg = res?.data?.messages?.[0];
      if (msg?.messageId || msg?.status?.name) {
        console.info("Infobip SMS sent:", {
          messageId: msg?.messageId,
          status: msg?.status?.name,
        });
      }
      return { provider: "infobip", response: res.data };
    } catch (err) {
      console.error(
        "Infobip SMS send error:",
        err?.response?.status,
        err?.response?.data || err?.message
      );
      throw normalizeError(err);
    }
  },
};
