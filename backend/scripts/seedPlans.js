import dotenv from "dotenv";
import connectDB from "../config/db.js";
import Plan from "../models/Plan.js";
import { MEMBERSHIP_PLAN_DEFINITIONS } from "../constants/membershipPlans.js";

dotenv.config();

const upsertPlans = async () => {
  await connectDB();

  for (const definition of MEMBERSHIP_PLAN_DEFINITIONS) {
    const payload = {
      name: definition.name,
      slug: definition.slug,
      price: definition.price,
      currency: definition.currency,
      durationDays: definition.durationDays,
      features: definition.features,
      isActive: definition.isActive,
      priorityLevel: definition.priorityLevel,
    };

    await Plan.findOneAndUpdate(
      { slug: definition.slug },
      { $set: payload },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  const plans = await Plan.find()
    .sort({ priorityLevel: -1, createdAt: 1 })
    .select("name slug price currency durationDays isActive priorityLevel");

  console.log("Plan seed completed:");
  for (const plan of plans) {
    console.log(
      `- ${plan.name} (${plan.slug}) | ${plan.currency} ${plan.price} | ${plan.durationDays} days | active=${plan.isActive}`
    );
  }
};

upsertPlans()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Plan seed failed:", error);
    process.exit(1);
  });
