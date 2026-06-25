import dotenv from "dotenv";
import connectDB from "../config/db.js";
import Plan from "../models/Plan.js";
import { MEMBERSHIP_PLANS } from "../constants/membershipPlans.js";

dotenv.config();

const args = new Set(process.argv.slice(2));
const isDryRun = args.has("--dry-run");
const isRevert = args.has("--revert");

// TEMP MPGS TEST PRICING - revert after card testing
const PRICE_PROFILES = {
  apply: {
    [MEMBERSHIP_PLANS.BASIC]: 50,
    [MEMBERSHIP_PLANS.PLUS]: 100,
    [MEMBERSHIP_PLANS.ADVANCED]: 150,
  },
  revert: {
    [MEMBERSHIP_PLANS.BASIC]: 3000,
    [MEMBERSHIP_PLANS.PLUS]: 5000,
    [MEMBERSHIP_PLANS.ADVANCED]: 15000,
  },
};

const TARGET_SLUGS = [
  MEMBERSHIP_PLANS.BASIC,
  MEMBERSHIP_PLANS.PLUS,
  MEMBERSHIP_PLANS.ADVANCED,
];

const selectedProfile = isRevert ? PRICE_PROFILES.revert : PRICE_PROFILES.apply;

const logPlanRow = (label, plan, targetPrice) => {
  console.log(`${label}:`, {
    id: String(plan._id),
    name: plan.name,
    slug: plan.slug,
    currentPrice: Number(plan.price),
    targetPrice: Number(targetPrice),
    currency: plan.currency,
    durationDays: Number(plan.durationDays),
    isActive: Boolean(plan.isActive),
  });
};

const main = async () => {
  await connectDB();

  const plans = await Plan.find({ slug: { $in: TARGET_SLUGS } })
    .sort({ priorityLevel: 1, createdAt: 1 })
    .select("_id name slug price currency durationDays isActive");

  if (plans.length !== TARGET_SLUGS.length) {
    const foundSlugs = plans.map((plan) => plan.slug);
    const missingSlugs = TARGET_SLUGS.filter((slug) => !foundSlugs.includes(slug));
    throw new Error(
      `Expected ${TARGET_SLUGS.length} premium plans, found ${plans.length}. Missing: ${missingSlugs.join(", ")}`
    );
  }

  console.log(
    isRevert
      ? "Reverting premium plan prices to production values."
      : "Applying temporary MPGS test prices to premium plans."
  );

  for (const slug of TARGET_SLUGS) {
    const plan = plans.find((entry) => entry.slug === slug);
    logPlanRow("Before", plan, selectedProfile[slug]);
  }

  if (isDryRun) {
    console.log("Dry run only. No plan prices were changed.");
    return;
  }

  for (const slug of TARGET_SLUGS) {
    const targetPrice = selectedProfile[slug];
    const plan = plans.find((entry) => entry.slug === slug);

    if (!plan) {
      throw new Error(`Plan with slug '${slug}' is missing during update.`);
    }

    await Plan.updateOne(
      { _id: plan._id, slug },
      { $set: { price: targetPrice, currency: "MWK" } }
    );
  }

  const updatedPlans = await Plan.find({ slug: { $in: TARGET_SLUGS } })
    .sort({ priorityLevel: 1, createdAt: 1 })
    .select("_id name slug price currency durationDays isActive");

  console.log("Updated premium plan prices:");
  for (const slug of TARGET_SLUGS) {
    const plan = updatedPlans.find((entry) => entry.slug === slug);
    logPlanRow("After", plan, selectedProfile[slug]);
  }
};

main()
  .then(async () => {
    await Plan.db.close();
    process.exit(0);
  })
  .catch(async (error) => {
    console.error("Failed to update MPGS test prices:", error.message || error);
    try {
      await Plan.db.close();
    } catch {}
    process.exit(1);
  });
