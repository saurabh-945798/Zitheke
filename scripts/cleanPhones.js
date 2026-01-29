import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";

dotenv.config();

const normalizePhone = (raw = "") =>
  String(raw).trim().replace(/\s+/g, "").replace(/^\+/, "");
const isValidMalawi = (phone) => /^265\d{7,9}$/.test(phone);

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  let updated = 0;
  let cleared = 0;

  const users = await User.find({
    phone: { $ne: null },
  }).select("_id phone uid email name");

  for (const user of users) {
    const raw = user.phone || "";
    const normalized = normalizePhone(raw);

    if (!normalized) {
      await User.updateOne({ _id: user._id }, { $set: { phone: null } });
      cleared += 1;
      continue;
    }

    if (isValidMalawi(normalized)) {
      if (normalized !== raw) {
        await User.updateOne(
          { _id: user._id },
          { $set: { phone: normalized } }
        );
        updated += 1;
      }
      continue;
    }

    await User.updateOne({ _id: user._id }, { $set: { phone: null } });
    cleared += 1;
  }

  console.log(`✅ Phones normalized: ${updated}`);
  console.log(`✅ Phones cleared (non‑Malawi/empty): ${cleared}`);
  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error("❌ Phone cleanup failed:", err);
  process.exit(1);
});
