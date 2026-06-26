import dotenv from "dotenv";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "../config/db.js";
import Plan from "../models/Plan.js";
import {
  MEMBERSHIP_PLAN_DEFINITIONS,
  MEMBERSHIP_PLANS,
} from "../constants/membershipPlans.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendRoot = path.resolve(__dirname, "..");
const backupsDir = path.join(backendRoot, "backups");

dotenv.config({ path: path.join(backendRoot, ".env") });

// Dry run (default): node backend/scripts/update-boost-plans-mwk.js
// Apply changes:      node backend/scripts/update-boost-plans-mwk.js --apply

const args = new Set(process.argv.slice(2));
const shouldApply = args.has("--apply");

const TARGET_PLAN_SLUGS = [
  MEMBERSHIP_PLANS.BASIC,
  MEMBERSHIP_PLANS.ESSENTIALS,
  MEMBERSHIP_PLANS.PLUS,
  MEMBERSHIP_PLANS.ADVANCED,
];

const TARGET_PLANS = MEMBERSHIP_PLAN_DEFINITIONS
  .filter((plan) => TARGET_PLAN_SLUGS.includes(plan.slug))
  .map((plan) => ({
    slug: plan.slug,
    name: plan.name,
    price: Number(plan.price),
    currency: String(plan.currency || "MWK").trim().toUpperCase(),
    durationDays: Number(plan.durationDays),
    features: Array.isArray(plan.features) ? [...plan.features] : [],
    priorityLevel: Number(plan.priorityLevel || 0),
    isActive: plan.isActive !== false,
  }));

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

const summarizePlan = (plan) => ({
  name: plan.name,
  slug: plan.slug,
  price: Number(plan.price),
  currency: plan.currency,
  durationDays: Number(plan.durationDays),
  features: Array.isArray(plan.features) ? plan.features : [],
  isActive: Boolean(plan.isActive),
  priorityLevel: Number(plan.priorityLevel || 0),
});

const createBackup = async (matchedDocs) => {
  await fs.mkdir(backupsDir, { recursive: true });
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupPath = path.join(
    backupsDir,
    `boost-plans-backup-${timestamp}.json`
  );

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
    usedIds.add(String(slugMatches[0]._id));
    return {
      plan: slugMatches[0],
      matchedBy: "slug",
    };
  }

  const nameMatches = allPlans.filter(
    (plan) =>
      normalize(plan.name) === normalize(target.name) &&
      !usedIds.has(String(plan._id))
  );

  if (nameMatches.length > 1) {
    throw new Error(
      `Multiple plans found with normalized name '${target.name}'. Resolve duplicates before running this migration.`
    );
  }

  if (nameMatches[0]) {
    usedIds.add(String(nameMatches[0]._id));
    return {
      plan: nameMatches[0],
      matchedBy: "name",
    };
  }

  return {
    plan: null,
    matchedBy: "missing",
  };
};

const hasSameFeatures = (left = [], right = []) =>
  JSON.stringify(left) === JSON.stringify(right);

const main = async () => {
  await connectDB();

  const allPlans = await Plan.find()
    .sort({ priorityLevel: 1, createdAt: 1 })
    .select(
      "_id name slug price currency durationDays features isActive priorityLevel createdAt updatedAt"
    );

  console.log("Boost plan MWK migration");
  console.log("Database connected:", Plan.db?.name || "unknown");
  console.log("Model used:", Plan.modelName);
  console.log("Collection used:", Plan.collection.collectionName);
  console.log("Mode:", shouldApply ? "APPLY" : "DRY RUN");
  console.log(
    "Safety: existing Payment and Subscription documents are not read or modified by this script."
  );

  const usedIds = new Set();
  const operations = TARGET_PLANS.map((target) => {
    const match = findExistingPlan(target, allPlans, usedIds);
    return {
      target,
      existing: match.plan,
      matchedBy: match.matchedBy,
      action: match.plan ? "update" : "create",
    };
  });

  const matchedDocs = operations.map((operation) => operation.existing).filter(Boolean);
  const backupPath = await createBackup(matchedDocs);

  console.log("Backup path:", backupPath);
  console.log("Planned changes:");

  for (const operation of operations) {
    console.log({
      action: operation.action,
      matchedBy: operation.matchedBy,
      before: operation.existing ? summarizePlan(operation.existing) : null,
      after: summarizePlan(operation.target),
    });
  }

  if (!shouldApply) {
    console.log("Dry run complete. No plan records were written.");
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

    if (!operation.existing) {
      await Plan.create(payload);
      createdCount += 1;
      continue;
    }

    const existing = operation.existing;
    const unchanged =
      existing.name === payload.name &&
      existing.slug === payload.slug &&
      Number(existing.price) === payload.price &&
      existing.currency === payload.currency &&
      Number(existing.durationDays) === payload.durationDays &&
      Boolean(existing.isActive) === payload.isActive &&
      Number(existing.priorityLevel || 0) === payload.priorityLevel &&
      hasSameFeatures(existing.features || [], payload.features);

    if (unchanged) {
      skippedCount += 1;
      continue;
    }

    await Plan.updateOne({ _id: existing._id }, { $set: payload });
    updatedCount += 1;
  }

  const finalPlans = await Plan.find({
    slug: { $in: TARGET_PLAN_SLUGS },
  })
    .sort({ priorityLevel: 1, createdAt: 1 })
    .select("_id name slug price currency durationDays features isActive priorityLevel");

  console.log("Apply complete");
  console.log({
    created: createdCount,
    updated: updatedCount,
    skipped: skippedCount,
  });
  console.log("Final verification output:");
  for (const plan of finalPlans) {
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
