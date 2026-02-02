import mongoose from "mongoose";
import dotenv from "dotenv";
import Ad from "../models/Ad.js";
import User from "../models/User.js";
import { normalizeMalawiPhone } from "../utils/phone.js";

dotenv.config();

const DEFAULT_EMAIL = "infoalinafeonline@gmail.com";
const TARGET_EMAIL = process.argv[2] || DEFAULT_EMAIL;

const run = async () => {
  if (!TARGET_EMAIL) {
    console.error(
      "? Missing email. Usage: node scripts/normalizeAdPhonesForEmail.js <email>"
    );
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);

  const ads = await Ad.find({ ownerEmail: TARGET_EMAIL }).select(
    "_id ownerPhone"
  );

  let updated = 0;
  let skipped = 0;

  for (const ad of ads) {
    const normalized = normalizeMalawiPhone(ad.ownerPhone || "");
    if (!normalized) {
      skipped += 1;
      continue;
    }
    if (normalized === ad.ownerPhone) {
      skipped += 1;
      continue;
    }
    await Ad.updateOne({ _id: ad._id }, { $set: { ownerPhone: normalized } });
    updated += 1;
  }

  console.log(`? Ads updated: ${updated}`);
  console.log(`? Ads skipped: ${skipped}`);

  const user = await User.findOne({ email: TARGET_EMAIL }).select(
    "_id phone"
  );
  if (user) {
    const normalized = normalizeMalawiPhone(user.phone || "");
    if (normalized && normalized !== user.phone) {
      await User.updateOne(
        { _id: user._id },
        { $set: { phone: normalized } }
      );
      console.log("? User phone updated");
    } else if (!normalized) {
      await User.updateOne({ _id: user._id }, { $set: { phone: null } });
      console.log("? User phone cleared (non-Malawi)");
    } else {
      console.log("? User phone already Malawi format");
    }
  } else {
    console.log("?? No user found for that email");
  }

  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error("? Normalize ad phones failed:", err);
  process.exit(1);
});
