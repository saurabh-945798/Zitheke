import crypto from "crypto";
import PhoneOtp from "../models/PhoneOtp.js";

export const OTP_RESEND_COOLDOWN_SECONDS = 60;

export const hashOtp = (otp) =>
  crypto.createHash("sha256").update(String(otp)).digest("hex");

export const generateOtp = () => String(crypto.randomInt(100000, 1000000));

export const issueOtpRecord = async ({
  phone,
  purpose,
  ttlMinutes = 5,
  cooldownSeconds = OTP_RESEND_COOLDOWN_SECONDS,
}) => {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + ttlMinutes * 60 * 1000);
  const resendAllowedAt = new Date(now.getTime() + cooldownSeconds * 1000);

  const active = await PhoneOtp.findOne({ phone, purpose, status: "active" }).sort({
    createdAt: -1,
  });

  if (active?.resendAllowedAt && active.resendAllowedAt > now) {
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((active.resendAllowedAt.getTime() - now.getTime()) / 1000)
    );
    return { blocked: true, retryAfterSeconds };
  }

  const otp = generateOtp();
  const codeHash = hashOtp(otp);

  const updatePayload = {
    $set: {
      codeHash,
      expiresAt,
      resendAllowedAt,
      attempts: 0,
      status: "active",
      lockedUntil: null,
      lastSentAt: now,
      messageId: "",
      providerStatus: "",
      providerGroup: "",
      sendFailedAt: null,
      sendFailReason: "",
    },
  };

  let record;
  if (active?._id) {
    // Atomic update on the current active record
    record = await PhoneOtp.findOneAndUpdate(
      { _id: active._id, status: "active" },
      updatePayload,
      { new: true }
    );
  }

  if (!record) {
    // Atomic upsert path for first OTP creation / race-safe replacement
    try {
      record = await PhoneOtp.findOneAndUpdate(
        { phone, purpose, status: "active" },
        {
          ...updatePayload,
          $setOnInsert: { phone, purpose, status: "active" },
        },
        { new: true, upsert: true }
      );
    } catch (err) {
      // Concurrent upsert race on unique active index: re-read latest active and apply cooldown.
      if (err?.code === 11000) {
        const latest = await PhoneOtp.findOne({
          phone,
          purpose,
          status: "active",
        }).sort({ createdAt: -1 });
        if (latest?.resendAllowedAt && latest.resendAllowedAt > now) {
          const retryAfterSeconds = Math.max(
            1,
            Math.ceil((latest.resendAllowedAt.getTime() - now.getTime()) / 1000)
          );
          return { blocked: true, retryAfterSeconds };
        }
      }
      throw err;
    }
  }

  return { blocked: false, otp, record, expiresAt, resendAllowedAt };
};

export const markOtpSendFailed = async (otpId, reason) => {
  if (!otpId) return;
  await PhoneOtp.updateOne(
    { _id: otpId },
    {
      status: "send_failed",
      sendFailedAt: new Date(),
      sendFailReason: String(reason || "SMS send failed"),
    }
  );
};

export const markOtpProviderMeta = async (
  otpId,
  { messageId = "", providerStatus = "", providerGroup = "" } = {}
) => {
  if (!otpId) return;
  await PhoneOtp.updateOne(
    { _id: otpId },
    {
      messageId,
      providerStatus,
      providerGroup,
    }
  );
};
