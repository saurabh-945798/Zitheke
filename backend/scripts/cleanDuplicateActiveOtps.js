import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import PhoneOtp from "../models/PhoneOtp.js";

dotenv.config();

const run = async () => {
  await connectDB();

  const groups = await PhoneOtp.aggregate([
    { $match: { status: "active" } },
    {
      $group: {
        _id: { phone: "$phone", purpose: "$purpose" },
        ids: { $push: { _id: "$_id", createdAt: "$createdAt" } },
        count: { $sum: 1 },
      },
    },
    { $match: { count: { $gt: 1 } } },
  ]);

  let cleaned = 0;
  for (const g of groups) {
    const sorted = [...g.ids].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    const keep = sorted[0]?._id;
    const invalidate = sorted.slice(1).map((x) => x._id);
    if (!keep || invalidate.length === 0) continue;

    await PhoneOtp.updateMany(
      { _id: { $in: invalidate } },
      { status: "invalidated" }
    );
    cleaned += invalidate.length;
  }

  console.log(`Duplicate active OTPs invalidated: ${cleaned}`);
  await mongoose.connection.close();
};

run().catch(async (err) => {
  console.error("Cleanup failed:", err?.message || err);
  try {
    await mongoose.connection.close();
  } catch {}
  process.exit(1);
});
