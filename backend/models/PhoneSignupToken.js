import mongoose from "mongoose";

const phoneSignupTokenSchema = new mongoose.Schema(
  {
    phone: { type: String, required: true, index: true },
    tokenHash: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true, index: { expireAfterSeconds: 0 } },
    revokedAt: { type: Date, default: null },
    usedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model("PhoneSignupToken", phoneSignupTokenSchema);
