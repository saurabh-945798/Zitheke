import dotenv from "dotenv";
import mongoose from "mongoose";

import connectDB from "../config/db.js";
import Payment from "../models/Payment.js";
import Subscription from "../models/Subscription.js";
import PaymentEvent from "../models/PaymentEvent.js";

dotenv.config();

const run = async () => {
  const dryRun = process.argv.includes("--dry-run");

  await connectDB();

  try {
    const [paymentsCount, subscriptionsCount, paymentEventsCount] =
      await Promise.all([
        Payment.countDocuments(),
        Subscription.countDocuments(),
        PaymentEvent.countDocuments(),
      ]);

    console.log("Revenue & Subscriptions reset scope:");
    console.log(`- payments: ${paymentsCount}`);
    console.log(`- subscriptions: ${subscriptionsCount}`);
    console.log(`- paymentevents: ${paymentEventsCount}`);
    console.log("- unaffected: users, plans, ads, messages, reports, favorites");

    if (dryRun) {
      console.log("Dry run only. No data was deleted.");
      return;
    }

    const [paymentsResult, subscriptionsResult, paymentEventsResult] =
      await Promise.all([
        Payment.deleteMany({}),
        Subscription.deleteMany({}),
        PaymentEvent.deleteMany({}),
      ]);

    console.log("Reset complete:");
    console.log(`- payments deleted: ${paymentsResult.deletedCount}`);
    console.log(`- subscriptions deleted: ${subscriptionsResult.deletedCount}`);
    console.log(`- paymentevents deleted: ${paymentEventsResult.deletedCount}`);
  } finally {
    await mongoose.connection.close();
  }
};

run().catch((error) => {
  console.error("Failed to reset Revenue & Subscriptions test data:", error);
  mongoose.connection
    .close()
    .catch(() => {})
    .finally(() => process.exit(1));
});
