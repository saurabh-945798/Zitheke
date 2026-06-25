import dotenv from "dotenv";
import fs from "fs/promises";
import path from "path";
import mongoose from "mongoose";
import { fileURLToPath } from "url";

import connectDB from "../config/db.js";
import Ad from "../models/Ad.js";
import Category from "../models/Category.js";

dotenv.config();

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const BACKEND_DIR = path.resolve(SCRIPT_DIR, "..");
const REPORT_PATH = path.join(BACKEND_DIR, "reports", "category-migration-audit.json");
const BACKUPS_DIR = path.join(BACKEND_DIR, "backups");

const args = new Set(process.argv.slice(2));
const isDryRun = args.has("--dry-run");

const APPROVED_CATEGORY_RENAMES = {
  alcohol: "Alcohol & Tobacco",
};

const APPROVED_SUBCATEGORY_RENAMES = {
  mobiles: {
    "mobile accessories": "Accessories",
  },
};

const collapseWhitespace = (value = "") =>
  String(value || "").replace(/\s+/g, " ").trim();

const normalizeKey = (value = "") => collapseWhitespace(value).toLowerCase();

const slugify = (value = "") =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
    .slice(0, 140);

const timestampForFilename = () =>
  new Date().toISOString().replace(/[:.]/g, "-");

const readAuditReport = async () => {
  const raw = await fs.readFile(REPORT_PATH, "utf8");
  return JSON.parse(raw);
};

const canonicalizeCategoryName = (name = "") => {
  const normalized = normalizeKey(name);
  return APPROVED_CATEGORY_RENAMES[normalized] || collapseWhitespace(name);
};

const canonicalizeSubcategoryName = (categoryName = "", subcategoryName = "") => {
  const categoryNormalized = normalizeKey(categoryName);
  const subcategoryNormalized = normalizeKey(subcategoryName);

  if (!subcategoryNormalized) return "";

  if (subcategoryNormalized === "others") {
    return "Other Products";
  }

  const categoryRules = APPROVED_SUBCATEGORY_RENAMES[categoryNormalized];
  if (categoryRules?.[subcategoryNormalized]) {
    return categoryRules[subcategoryNormalized];
  }

  return collapseWhitespace(subcategoryName);
};

const buildCanonicalTaxonomy = (auditReport) => {
  const unifiedCandidates = Array.isArray(auditReport?.unifiedCategoryCandidates)
    ? auditReport.unifiedCategoryCandidates
    : [];

  const taxonomy = new Map();

  const ensureCategory = (name) => {
    const canonicalName = canonicalizeCategoryName(name);
    const key = normalizeKey(canonicalName);
    if (!taxonomy.has(key)) {
      taxonomy.set(key, {
        name: canonicalName,
        slug: slugify(canonicalName),
        keywords: [],
        isActive: true,
        subcategories: new Map(),
        sourceVariants: new Set(),
      });
    }
    return taxonomy.get(key);
  };

  for (const candidate of unifiedCandidates) {
    const categoryVariants = Array.isArray(candidate?.sourceVariants)
      ? candidate.sourceVariants
      : [];

    if (categoryVariants.length === 0) continue;

    const category = ensureCategory(categoryVariants[0]);
    for (const variant of categoryVariants) {
      category.sourceVariants.add(collapseWhitespace(variant));
    }

    const subcategories = Array.isArray(candidate?.subcategories)
      ? candidate.subcategories
      : [];

    for (const subCandidate of subcategories) {
      const subVariants = Array.isArray(subCandidate?.sourceVariants)
        ? subCandidate.sourceVariants
        : [];

      for (const variant of subVariants) {
        const canonicalSubcategory = canonicalizeSubcategoryName(category.name, variant);
        if (!canonicalSubcategory) continue;
        const subKey = normalizeKey(canonicalSubcategory);
        if (!category.subcategories.has(subKey)) {
          category.subcategories.set(subKey, {
            name: canonicalSubcategory,
            slug: slugify(canonicalSubcategory),
            isActive: true,
            sourceVariants: new Set(),
          });
        }
        category.subcategories.get(subKey).sourceVariants.add(collapseWhitespace(variant));
      }
    }
  }

  // Enforce zero-ad categories explicitly.
  ensureCategory("Hobbies & Entertainment");
  ensureCategory("Music");

  const hobbies = taxonomy.get(normalizeKey("Hobbies & Entertainment"));
  if (hobbies && !hobbies.subcategories.has(normalizeKey("Music Instruments"))) {
    hobbies.subcategories.set(normalizeKey("Music Instruments"), {
      name: "Music Instruments",
      slug: slugify("Music Instruments"),
      isActive: true,
      sourceVariants: new Set(["Music Instruments"]),
    });
  }

  const music = taxonomy.get(normalizeKey("Music"));
  for (const subcategoryName of [
    "Accessories",
    "Amplifiers",
    "DJ Equipment",
    "Drums & Percussion",
    "Guitars",
    "Keyboards & Pianos",
    "Microphones",
    "Musical Instruments",
    "Sound Systems",
    "Studio Equipment",
  ]) {
    const subKey = normalizeKey(subcategoryName);
    if (!music.subcategories.has(subKey)) {
      music.subcategories.set(subKey, {
        name: subcategoryName,
        slug: slugify(subcategoryName),
        isActive: true,
        sourceVariants: new Set([subcategoryName]),
      });
    }
  }

  // Remove deprecated canonical duplicate category if merged.
  taxonomy.delete(normalizeKey("Alcohol"));

  return [...taxonomy.values()]
    .map((category) => ({
      name: category.name,
      slug: category.slug,
      keywords: [],
      isActive: true,
      sourceVariants: [...category.sourceVariants].sort((a, b) => a.localeCompare(b)),
      subcategories: [...category.subcategories.values()]
        .map((subcategory) => ({
          name: subcategory.name,
          slug: subcategory.slug,
          isActive: true,
          sourceVariants: [...subcategory.sourceVariants].sort((a, b) =>
            a.localeCompare(b)
          ),
        }))
        .sort((a, b) => a.name.localeCompare(b.name)),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
};

const createBackup = async (categories) => {
  await fs.mkdir(BACKUPS_DIR, { recursive: true });
  const backupPath = path.join(
    BACKUPS_DIR,
    `categories-backup-${timestampForFilename()}.json`
  );
  await fs.writeFile(backupPath, JSON.stringify(categories, null, 2), "utf8");
  return backupPath;
};

const findExistingCategoryMatches = (existingCategories, canonicalCategory) => {
  const normalizedName = normalizeKey(canonicalCategory.name);
  return existingCategories.filter((category) => {
    const nameMatch = normalizeKey(category.name) === normalizedName;
    const slugMatch = collapseWhitespace(category.slug || "") === canonicalCategory.slug;
    return nameMatch || slugMatch;
  });
};

const migrateCategories = async (canonicalTaxonomy) => {
  const existingCategories = await Category.find({})
    .sort({ name: 1 })
    .select("name slug isActive keywords subcategories")
    .exec();

  const backupPath = await createBackup(
    existingCategories.map((category) => category.toObject())
  );

  const summary = {
    backupPath,
    categoriesCreated: [],
    categoriesSkippedExisting: [],
    subcategoriesCreated: [],
    subcategoriesSkippedExisting: [],
    skippedAmbiguous: [],
    adCountBefore: await Ad.countDocuments({}),
  };

  for (const canonicalCategory of canonicalTaxonomy) {
    const categoryMatches = findExistingCategoryMatches(
      existingCategories,
      canonicalCategory
    );

    if (categoryMatches.length > 1) {
      summary.skippedAmbiguous.push({
        type: "category",
        canonicalName: canonicalCategory.name,
        matches: categoryMatches.map((category) => ({
          id: String(category._id),
          name: category.name,
          slug: category.slug,
        })),
      });
      continue;
    }

    let targetCategory = categoryMatches[0] || null;
    let categoryCreated = false;

    if (!targetCategory) {
      if (isDryRun) {
        summary.categoriesCreated.push({
          name: canonicalCategory.name,
          slug: canonicalCategory.slug,
          mode: "dry-run",
        });
        targetCategory = new Category({
          name: canonicalCategory.name,
          slug: canonicalCategory.slug,
          keywords: canonicalCategory.keywords,
          isActive: true,
          subcategories: [],
        });
      } else {
        targetCategory = await Category.create({
          name: canonicalCategory.name,
          slug: canonicalCategory.slug,
          keywords: canonicalCategory.keywords,
          isActive: true,
          subcategories: [],
        });
        existingCategories.push(targetCategory);
        summary.categoriesCreated.push({
          id: String(targetCategory._id),
          name: targetCategory.name,
          slug: targetCategory.slug,
          mode: "created",
        });
      }
      categoryCreated = true;
    } else {
      summary.categoriesSkippedExisting.push({
        id: String(targetCategory._id),
        name: targetCategory.name,
        slug: targetCategory.slug,
      });
    }

    const existingSubcategories = Array.isArray(targetCategory.subcategories)
      ? targetCategory.subcategories
      : [];

    let categoryMutated = false;

    for (const canonicalSubcategory of canonicalCategory.subcategories) {
      const subcategoryMatches = existingSubcategories.filter((subcategory) => {
        const nameMatch =
          normalizeKey(subcategory.name) === normalizeKey(canonicalSubcategory.name);
        const slugMatch =
          collapseWhitespace(subcategory.slug || "") === canonicalSubcategory.slug;
        return nameMatch || slugMatch;
      });

      if (subcategoryMatches.length > 1) {
        summary.skippedAmbiguous.push({
          type: "subcategory",
          category: canonicalCategory.name,
          canonicalName: canonicalSubcategory.name,
          matches: subcategoryMatches.map((subcategory) => ({
            id: String(subcategory._id),
            name: subcategory.name,
            slug: subcategory.slug,
          })),
        });
        continue;
      }

      if (subcategoryMatches.length === 1) {
        summary.subcategoriesSkippedExisting.push({
          category: canonicalCategory.name,
          name: subcategoryMatches[0].name,
          slug: subcategoryMatches[0].slug,
        });
        continue;
      }

      if (isDryRun) {
        summary.subcategoriesCreated.push({
          category: canonicalCategory.name,
          name: canonicalSubcategory.name,
          slug: canonicalSubcategory.slug,
          mode: "dry-run",
        });
      } else {
        targetCategory.subcategories.push({
          name: canonicalSubcategory.name,
          slug: canonicalSubcategory.slug,
          isActive: true,
        });
        categoryMutated = true;
        summary.subcategoriesCreated.push({
          category: canonicalCategory.name,
          name: canonicalSubcategory.name,
          slug: canonicalSubcategory.slug,
          mode: categoryCreated ? "created-with-category" : "appended",
        });
      }
    }

    if (!isDryRun && categoryMutated) {
      targetCategory.markModified("subcategories");
      await targetCategory.save();
    }
  }

  const finalCategories = await Category.find({})
    .sort({ name: 1 })
    .select("name slug subcategories isActive")
    .lean();

  summary.finalCategoryCount = finalCategories.length;
  summary.finalSubcategoryCount = finalCategories.reduce(
    (count, category) => count + (category.subcategories?.length || 0),
    0
  );
  summary.finalCategories = finalCategories.map((category) => ({
    name: category.name,
    slug: category.slug,
    isActive: Boolean(category.isActive),
    subcategoryCount: category.subcategories?.length || 0,
    subcategories: (category.subcategories || []).map((subcategory) => ({
      name: subcategory.name,
      slug: subcategory.slug,
      isActive: Boolean(subcategory.isActive),
    })),
  }));
  summary.adCountAfter = await Ad.countDocuments({});
  summary.confirmations = {
    hasAlcoholAndTobacco: finalCategories.some(
      (category) => normalizeKey(category.name) === normalizeKey("Alcohol & Tobacco")
    ),
    hasStandaloneAlcohol: finalCategories.some(
      (category) => normalizeKey(category.name) === normalizeKey("Alcohol")
    ),
    hasHobbiesEntertainment: finalCategories.some(
      (category) =>
        normalizeKey(category.name) === normalizeKey("Hobbies & Entertainment")
    ),
    hasMusic: finalCategories.some(
      (category) => normalizeKey(category.name) === normalizeKey("Music")
    ),
    mobilesHasAccessoriesOnly: finalCategories.some((category) => {
      if (normalizeKey(category.name) !== normalizeKey("Mobiles")) return false;
      const normalizedSubcategories = new Set(
        (category.subcategories || []).map((subcategory) => normalizeKey(subcategory.name))
      );
      return (
        normalizedSubcategories.has(normalizeKey("Accessories")) &&
        !normalizedSubcategories.has(normalizeKey("Mobile Accessories"))
      );
    }),
    adCountUnchanged: summary.adCountBefore === summary.adCountAfter,
  };

  return summary;
};

const printSummary = (summary) => {
  console.log(
    isDryRun ? "Category migration dry-run complete." : "Category migration complete."
  );
  console.log(`Backup file: ${summary.backupPath}`);
  console.log(`Categories created: ${summary.categoriesCreated.length}`);
  console.log(`Categories skipped (existing): ${summary.categoriesSkippedExisting.length}`);
  console.log(`Subcategories created: ${summary.subcategoriesCreated.length}`);
  console.log(
    `Subcategories skipped (existing): ${summary.subcategoriesSkippedExisting.length}`
  );
  console.log(`Skipped for ambiguity: ${summary.skippedAmbiguous.length}`);
  console.log(`Final category count: ${summary.finalCategoryCount}`);
  console.log(`Final subcategory count: ${summary.finalSubcategoryCount}`);
  console.log("Confirmation checks:", summary.confirmations);

  if (summary.skippedAmbiguous.length > 0) {
    console.log("Ambiguous skips:");
    for (const item of summary.skippedAmbiguous) {
      console.log("-", JSON.stringify(item));
    }
  }

  console.log("Final categories:");
  for (const category of summary.finalCategories) {
    console.log(`- ${category.name} (${category.subcategoryCount} subcategories)`);
  }
};

const main = async () => {
  await connectDB();

  try {
    const auditReport = await readAuditReport();
    const canonicalTaxonomy = buildCanonicalTaxonomy(auditReport);
    const summary = await migrateCategories(canonicalTaxonomy);
    printSummary(summary);
  } finally {
    await mongoose.connection.close();
  }
};

main().catch(async (error) => {
  console.error("Category migration failed:", error?.message || error);
  try {
    await mongoose.connection.close();
  } catch {}
  process.exit(1);
});
