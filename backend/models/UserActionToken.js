// models/UserActionToken.js
import mongoose from "mongoose";

const userActionTokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    purpose: {
      type: String,
      enum: [
        "email_verify",
        "password_set",
        "password_reset",
        "password_reset_otp",
        "password_reset_otp_session",
        "delete_account",
      ],
      required: true,
    },
    tokenHash: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true, index: { expireAfterSeconds: 0 } },
    usedAt: { type: Date, default: null },
    meta: { type: Object, default: {} },
  },
  { timestamps: true }
);

const UserActionToken = mongoose.model("UserActionToken", userActionTokenSchema);
export default UserActionToken;
