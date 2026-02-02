import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    userUid: { type: String, required: true, index: true },
    refreshTokenHash: { type: String, required: true },
    userAgent: { type: String, default: "" },
    ip: { type: String, default: "" },
    lastUsedAt: { type: Date, default: Date.now },
    revokedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

sessionSchema.index({ userUid: 1, createdAt: -1 });

export default mongoose.model("Session", sessionSchema);
