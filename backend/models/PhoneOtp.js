// models/PhoneOtp.js
import mongoose from "mongoose";

const phoneOtpSchema = new mongoose.Schema(
  {
    phone: { type: String, required: true, index: true },
    codeHash: { type: String, required: true },
    purpose: { type: String, default: "login" },
    status: {
      type: String,
      enum: ["active", "verified", "expired", "invalidated", "send_failed"],
      default: "active",
      index: true,
    },
    resendAllowedAt: { type: Date, default: null, index: true },
    expiresAt: { type: Date, required: true, index: { expireAfterSeconds: 0 } },
    attempts: { type: Number, default: 0 },
    lockedUntil: { type: Date, default: null },
    lastSentAt: { type: Date, default: null },
    messageId: { type: String, default: "" },
    providerStatus: { type: String, default: "" },
    providerGroup: { type: String, default: "" },
    sendFailedAt: { type: Date, default: null },
    sendFailReason: { type: String, default: "" },
  },
  { timestamps: true }
);

// Keep one active OTP record per phone+purpose.
// Run cleanup script before this is created in production with existing data.
phoneOtpSchema.index(
  { phone: 1, purpose: 1, status: 1 },
  {
    unique: true,
    partialFilterExpression: { status: "active" },
    name: "uniq_active_otp_per_phone_purpose",
  }
);

const PhoneOtp = mongoose.model("PhoneOtp", phoneOtpSchema);
export default PhoneOtp;
