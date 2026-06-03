import mongoose from "mongoose";
import connectDB from "../config/db.js";
import subscriptionExpiryService from "../Services/payments/subscriptionExpiry.service.js";

const run = async () => {
  try {
    await connectDB();

    const summary = await subscriptionExpiryService.runExpirySync({
      source: "manual_script",
    });

    console.log("Subscription expiry sync completed");
    console.log(JSON.stringify(summary, null, 2));
  } catch (error) {
    console.error("Subscription expiry sync failed:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close().catch(() => {});
  }
};

run();
