import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";
import { normalizeMalawiPhone, isValidMalawiPhone } from "../utils/phone.js";

dotenv.config();

const [, , emailArg, phoneArg] = process.argv;

if (!emailArg || !phoneArg) {
  console.error("? Usage: node scripts/setUserPhoneForEmail.js <email> <phone>");
  process.exit(1);
}

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const normalized = normalizeMalawiPhone(phoneArg);
  if (!normalized || !isValidMalawiPhone(normalized)) {
    console.error("? Invalid Malawi phone. Use +265XXXXXXXXX or local digits.");
    process.exit(1);
  }

  const user = await User.findOne({ email: emailArg.trim().toLowerCase() });
  if (!user) {
    console.error("? User not found for email", emailArg);
    process.exit(1);
  }

  user.phone = normalized;
  user.phoneVerified = true;
  await user.save();

  console.log("? Phone updated:", { email: user.email, phone: user.phone });
  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error("? Failed:", err);
  process.exit(1);
});
