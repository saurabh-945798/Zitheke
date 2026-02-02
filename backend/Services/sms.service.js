// src/services/sms.service.js
import { infobipClient } from "../config/infobip.js";
import { env } from "../config/env.js";

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

export const SmsService = {
  async sendOtp({ to, otp, minutes = 5 }) {
    const normalizedTo = normalizeTo(to);
    const payload = {
      messages: [
        {
          from: env.INFOBIP_SMS_SENDER,
          destinations: [{ to: normalizedTo }],
          text: `Your ZITHEKE login OTP is ${otp}.\nThis code is valid for ${minutes} minutes.\nDo not share it with anyone.`,
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

  async sendText({ to, text }) {
    const normalizedTo = normalizeTo(to);
    const payload = {
      messages: [
        {
          from: env.INFOBIP_SMS_SENDER,
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
