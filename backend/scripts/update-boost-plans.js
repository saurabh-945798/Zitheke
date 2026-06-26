import dotenv from "dotenv";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "../config/db.js";
import Plan from "../models/Plan.js";
import { MEMBERSHIP_PLANS } from "../constants/membershipPlans.js";

dotenv.config();

// Commands:
// Dry run (default): node scripts/update-boost-plans.js
// Apply changes:      node scripts/update-boost-plans.js --apply

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendRoot = path.resolve(__dirname, "..");
const backupsDir = path.join(backendRoot, "backups");

const args = new Set(process.argv.slice(2));
const shouldApply = args.has("--apply");

const TARGET_PLANS = [
  {
    slug: MEMBERSHIP_PLANS.BASIC,
    name: "SIMPLE START",
    price: 3000,
    currency: "MWK",
    durationDays: 7,
    features: [
      "Basic ad boost",
      "Standard visibility",
      "Email support",
    ],
    priorityLevel: 1,
    isActive: true,
  },
  {
    slug: "essentials",
    name: "ESSENTIALS",
    price: 5000,
    currency: "MWK",
    durationDays: 14,
    features: [
      "Higher ad ranking",
      "Boost badge",
      "Priority email support",
    ],
    priorityLevel: 2,
    isActive: true,
  },
  {
    slug: MEMBERSHIP_PLANS.PLUS,
    name: "PLUS",
    price: 7000,
    currency: "MWK",
    durationDays: 21,
    features: [
      "Top search placement",
      "Featured badge",
      "Up to 5x more views",
      "Priority buyer exposure",
    ],
    priorityLevel: 3,
    isActive: true,
  },
  {
    slug: MEMBERSHIP_PLANS.ADVANCED,
    name: "ADVANCED",
    price: 10000,
    currency: "MWK",
    durationDays: 28,
    features: [
      "Maximum visibility",
      "Premium featured badge",
      "Top placement across categories",
      "Dedicated support",
    ],
    priorityLevel: 4,
    isActive: true,
  },
];

const normalize = (value = "") =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

const cloneDoc = (doc) => ({
  _id: String(doc._id),
  name: doc.name,
  slug: doc.slug,
  price: Number(doc.price),
  currency: doc.currency,
  durationDays: Number(doc.durationDays),
  features: Array.isArray(doc.features) ? [...doc.features] : [],
  isActive: Boolean(doc.isActive),
  priorityLevel: Number(doc.priorityLevel || 0),
  createdAt: doc.createdAt,
  updatedAt: doc.updatedAt,
});

const summarizeChange = (beforeDoc, target) => ({
  before: beforeDoc
    ? {
        id: String(beforeDoc._id),
        name: beforeDoc.name,
        slug: beforeDoc.slug,
        price: Number(beforeDoc.price),
        currency: beforeDoc.currency,
        durationDays: Number(beforeDoc.durationDays),
        features: Array.isArray(beforeDoc.features) ? beforeDoc.features : [],
        isActive: Boolean(beforeDoc.isActive),
        priorityLevel: Number(beforeDoc.priorityLevel || 0),
      }
    : null,
  after: {
    name: target.name,
    slug: target.slug,
    price: target.price,
    currency: target.currency,
    durationDays: target.durationDays,
    features: target.features,
    isActive: target.isActive,
    priorityLevel: target.priorityLevel,
  },
});

const createBackup = async (matchedDocs) => {
  await fs.mkdir(backupsDir, { recursive: true });
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupPath = path.join(backupsDir, `boost-plan-backup-${timestamp}.json`);
  const payload = {
    createdAt: new Date().toISOString(),
    mode: shouldApply ? "apply" : "dry-run",
    collection: Plan.collection.collectionName,
    matchedCount: matchedDocs.length,
    matchedPlans: matchedDocs.map(cloneDoc),
  };
  await fs.writeFile(backupPath, JSON.stringify(payload, null, 2), "utf8");
  return backupPath;
};

const findExistingPlan = (target, allPlans, usedIds) => {
  const slugMatches = allPlans.filter((plan) => plan.slug === target.slug);
  if (slugMatches.length > 1) {
    throw new Error(
      `Multiple plans found with slug '${target.slug}'. Resolve duplicates before running this migration.`
    );
  }
  if (slugMatches[0]) {
    const matched = slugMatches[0];
    usedIds.add(String(matched._id));
    return matched;
  }

  const nameMatches = allPlans.filter(
    (plan) =>
      normalize(plan.name) === normalize(target.name) &&
      !usedIds.has(String(plan._id))
  );

  if (nameMatches.length > 1) {
    throw new Error(
      `Multiple plans found with name '${target.name}'. Resolve duplicates before running this migration.`
    );
  }

  if (nameMatches[0]) {
    const matched = nameMatches[0];
    usedIds.add(String(matched._id));
    return matched;
  }

  return null;
};

const main = async () => {
  await connectDB();

  const allPlans = await Plan.find()
    .sort({ priorityLevel: 1, createdAt: 1 })
    .select(
      "_id name slug price currency durationDays features isActive priorityLevel createdAt updatedAt"
    );

  console.log("Boost plan migration");
  console.log("Database collection:", Plan.collection.collectionName);
  console.log("Mode:", shouldApply ? "APPLY" : "DRY RUN");
  console.log("Historical safety: Payment and Subscription collections are not modified.");

  const usedIds = new Set();
  const operations = TARGET_PLANS.map((target) => {
    const existing = findExistingPlan(target, allPlans, usedIds);
    return {
      target,
      existing,
      action: existing ? "update" : "create",
      summary: summarizeChange(existing, target),
    };
  });

  const matchedDocs = operations
    .map((operation) => operation.existing)
    .filter(Boolean);

  const backupPath = await createBackup(matchedDocs);
  console.log("Backup path:", backupPath);

  for (const operation of operations) {
    console.log(
      operation.action === "create"
        ? `Would create plan '${operation.target.name}'`
        : `Would update plan '${operation.target.name}'`
    );
    console.log(operation.summary);
  }

  if (!shouldApply) {
    console.log("Dry run complete. No plan records were changed.");
    return;
  }

  let createdCount = 0;
  let updatedCount = 0;
  let skippedCount = 0;

  for (const operation of operations) {
    const payload = {
      name: operation.target.name,
      slug: operation.target.slug,
      price: operation.target.price,
      currency: operation.target.currency,
      durationDays: operation.target.durationDays,
      features: operation.target.features,
      isActive: operation.target.isActive,
      priorityLevel: operation.target.priorityLevel,
    };

    if (operation.existing) {
      const before = operation.existing;
      const unchanged =
        before.name === payload.name &&
        before.slug === payload.slug &&
        Number(before.price) === payload.price &&
        before.currency === payload.currency &&
        Number(before.durationDays) === payload.durationDays &&
        Boolean(before.isActive) === payload.isActive &&
        Number(before.priorityLevel || 0) === payload.priorityLevel &&
        JSON.stringify(before.features || []) === JSON.stringify(payload.features);

      if (unchanged) {
        skippedCount += 1;
        continue;
      }

      await Plan.updateOne({ _id: before._id }, { $set: payload });
      updatedCount += 1;
      continue;
    }

    await Plan.create(payload);
    createdCount += 1;
  }

  const verificationPlans = await Plan.find({
    slug: { $in: TARGET_PLANS.map((plan) => plan.slug) },
  })
    .sort({ priorityLevel: 1, createdAt: 1 })
    .select("_id name slug price currency durationDays features isActive priorityLevel");

  console.log("Apply complete");
  console.log({
    created: createdCount,
    updated: updatedCount,
    skipped: skippedCount,
  });
  console.log("Final verification results:");
  for (const plan of verificationPlans) {
    console.log({
      id: String(plan._id),
      name: plan.name,
      slug: plan.slug,
      price: Number(plan.price),
      currency: plan.currency,
      durationDays: Number(plan.durationDays),
      features: plan.features,
      isActive: Boolean(plan.isActive),
      priorityLevel: Number(plan.priorityLevel || 0),
    });
  }
};

main()
  .then(async () => {
    await Plan.db.close();
    process.exit(0);
  })
  .catch(async (error) => {
    console.error("Failed to update boost plans:", error.message || error);
    try {
      await Plan.db.close();
    } catch {}
    process.exit(1);
  });
