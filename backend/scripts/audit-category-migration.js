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
const ROOT_DIR = path.resolve(SCRIPT_DIR, "..", "..");
const BACKEND_DIR = path.resolve(SCRIPT_DIR, "..");
const REPORTS_DIR = path.join(BACKEND_DIR, "reports");
const REPORT_PATH = path.join(REPORTS_DIR, "category-migration-audit.json");

const SOURCE_FILES = {
  createAd: path.join(ROOT_DIR, "frontend", "src", "Components", "Dashboard", "CreateAd.jsx"),
  adminAllAds: path.join(ROOT_DIR, "admin", "src", "Components", "Dashboard", "AllAds.jsx"),
  categoryBar: path.join(ROOT_DIR, "frontend", "src", "Components", "CategoryBar", "categories.js"),
};

const AMBIGUOUS_RULES = [
  ["Alcohol", "Alcohol & Tobacco"],
  ["Others", "Other Products"],
  ["Accessories", "Mobile Accessories"],
];

const collapseWhitespace = (value = "") =>
  String(value || "").replace(/\s+/g, " ").trim();

const normalizeKey = (value = "") => collapseWhitespace(value).toLowerCase();

const titleCaseFallback = (value = "") =>
  collapseWhitespace(value)
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());

const uniqueSorted = (values = []) =>
  [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b));

const serializeError = (error) => ({
  message: error?.message || String(error),
  stack: error?.stack || "",
});

const extractObjectLiteral = (source, declaration) => {
  const startToken = `const ${declaration} =`;
  const startIndex = source.indexOf(startToken);
  if (startIndex === -1) {
    throw new Error(`Could not find declaration: ${declaration}`);
  }

  const braceStart = source.indexOf("{", startIndex);
  if (braceStart === -1) {
    throw new Error(`Could not find object start for: ${declaration}`);
  }

  let depth = 0;
  let inString = false;
  let stringChar = "";
  let escaped = false;

  for (let index = braceStart; index < source.length; index += 1) {
    const char = source[index];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === stringChar) {
        inString = false;
        stringChar = "";
      }
      continue;
    }

    if (char === "'" || char === '"' || char === "`") {
      inString = true;
      stringChar = char;
      continue;
    }

    if (char === "{") depth += 1;
    if (char === "}") {
      depth -= 1;
      if (depth === 0) {
        return source.slice(braceStart, index + 1);
      }
    }
  }

  throw new Error(`Could not close object literal for: ${declaration}`);
};

const parseObjectLiteral = (literal, label) => {
  try {
    return Function(`"use strict"; return (${literal});`)();
  } catch (error) {
    throw new Error(`Failed to parse ${label}: ${error.message}`);
  }
};

const readHardcodedSources = async () => {
  const [createAdSource, adminAllAdsSource, categoryBarSource] = await Promise.all([
    fs.readFile(SOURCE_FILES.createAd, "utf8"),
    fs.readFile(SOURCE_FILES.adminAllAds, "utf8"),
    fs.readFile(SOURCE_FILES.categoryBar, "utf8"),
  ]);

  const createAdMap = parseObjectLiteral(
    extractObjectLiteral(createAdSource, "subcategories"),
    "CreateAd subcategories"
  );
  const adminAllAdsMap = parseObjectLiteral(
    extractObjectLiteral(adminAllAdsSource, "CATEGORY_OPTIONS"),
    "Admin AllAds CATEGORY_OPTIONS"
  );
  const categoryBarMap = parseObjectLiteral(
    extractObjectLiteral(categoryBarSource, "rawCategories"),
    "CategoryBar rawCategories"
  );

  return {
    createAd: createAdMap,
    adminAllAds: adminAllAdsMap,
    categoryBar: categoryBarMap,
  };
};

const normalizeSourceCategoryMap = (rawMap, sourceType) => {
  const categories = [];

  for (const [rawCategoryName, rawSubcategories] of Object.entries(rawMap || {})) {
    const categoryName = collapseWhitespace(rawCategoryName);
    const subcategories = [];

    if (Array.isArray(rawSubcategories)) {
      for (const item of rawSubcategories) {
        if (typeof item === "string") {
          subcategories.push(collapseWhitespace(item));
          continue;
        }

        if (item && typeof item === "object") {
          subcategories.push(collapseWhitespace(item.name || item.label || ""));
        }
      }
    } else if (rawSubcategories && Array.isArray(rawSubcategories.subs)) {
      for (const item of rawSubcategories.subs) {
        subcategories.push(collapseWhitespace(item.label || item.name || item.key || ""));
      }
    }

    categories.push({
      category: categoryName,
      normalizedCategory: normalizeKey(categoryName),
      subcategories: uniqueSorted(subcategories),
      sourceType,
    });
  }

  return categories.sort((a, b) => a.category.localeCompare(b.category));
};

const getLiveAdData = async () => {
  const [
    adCount,
    distinctCategories,
    distinctPairs,
    categoryCounts,
    pairCounts,
    emptySubcategoryCount,
    emptyCategoryCount,
  ] = await Promise.all([
    Ad.countDocuments({}),
    Ad.distinct("category"),
    Ad.aggregate([
      {
        $group: {
          _id: {
            category: "$category",
            subcategory: "$subcategory",
          },
        },
      },
      { $sort: { "_id.category": 1, "_id.subcategory": 1 } },
    ]),
    Ad.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1, _id: 1 } },
    ]),
    Ad.aggregate([
      {
        $group: {
          _id: {
            category: "$category",
            subcategory: "$subcategory",
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1, "_id.category": 1, "_id.subcategory": 1 } },
    ]),
    Ad.countDocuments({
      $or: [{ subcategory: { $exists: false } }, { subcategory: null }, { subcategory: "" }],
    }),
    Ad.countDocuments({
      $or: [{ category: { $exists: false } }, { category: null }, { category: "" }],
    }),
  ]);

  return {
    adCount,
    distinctCategories: uniqueSorted(distinctCategories.map(collapseWhitespace)),
    distinctPairs: distinctPairs.map((row) => ({
      category: collapseWhitespace(row?._id?.category || ""),
      subcategory: collapseWhitespace(row?._id?.subcategory || ""),
    })),
    categoryCounts: categoryCounts.map((row) => ({
      category: collapseWhitespace(row._id || ""),
      count: Number(row.count || 0),
    })),
    pairCounts: pairCounts.map((row) => ({
      category: collapseWhitespace(row?._id?.category || ""),
      subcategory: collapseWhitespace(row?._id?.subcategory || ""),
      count: Number(row.count || 0),
    })),
    emptySubcategoryCount,
    emptyCategoryCount,
  };
};

const getExistingCategoryData = async () => {
  const categories = await Category.find({}, { name: 1, slug: 1, isActive: 1, subcategories: 1 })
    .sort({ name: 1 })
    .lean();

  return categories.map((category) => ({
    name: collapseWhitespace(category.name || ""),
    slug: collapseWhitespace(category.slug || ""),
    isActive: Boolean(category.isActive),
    subcategories: uniqueSorted(
      (category.subcategories || []).map((subcategory) =>
        collapseWhitespace(subcategory?.name || "")
      )
    ),
  }));
};

const buildUnifiedBuckets = ({ sourceMaps, liveAds, existingCategories }) => {
  const buckets = new Map();

  const ensureBucket = (displayName) => {
    const normalized = normalizeKey(displayName);
    if (!buckets.has(normalized)) {
      buckets.set(normalized, {
        normalizedCategory: normalized,
        variants: new Set(),
        sourceEntries: [],
        subcategoryBuckets: new Map(),
        liveAdCount: 0,
      });
    }
    return buckets.get(normalized);
  };

  const addSubcategory = (bucket, rawSubcategory, sourceLabel, liveCount = 0) => {
    const subcategory = collapseWhitespace(rawSubcategory);
    const normalizedSubcategory = normalizeKey(subcategory);
    if (!bucket.subcategoryBuckets.has(normalizedSubcategory)) {
      bucket.subcategoryBuckets.set(normalizedSubcategory, {
        normalizedSubcategory,
        variants: new Set(),
        sources: new Set(),
        liveAdCount: 0,
      });
    }
    const subBucket = bucket.subcategoryBuckets.get(normalizedSubcategory);
    if (subcategory) subBucket.variants.add(subcategory);
    if (sourceLabel) subBucket.sources.add(sourceLabel);
    if (liveCount) subBucket.liveAdCount += liveCount;
  };

  for (const [sourceName, entries] of Object.entries(sourceMaps)) {
    for (const entry of entries) {
      const bucket = ensureBucket(entry.category);
      bucket.variants.add(entry.category);
      bucket.sourceEntries.push({ source: sourceName, category: entry.category });
      for (const subcategory of entry.subcategories) {
        addSubcategory(bucket, subcategory, sourceName);
      }
    }
  }

  for (const row of liveAds.categoryCounts) {
    const bucket = ensureBucket(row.category);
    bucket.variants.add(row.category);
    bucket.sourceEntries.push({ source: "liveAds", category: row.category });
    bucket.liveAdCount += Number(row.count || 0);
  }

  for (const row of liveAds.pairCounts) {
    const bucket = ensureBucket(row.category);
    bucket.variants.add(row.category);
    addSubcategory(bucket, row.subcategory, "liveAds", Number(row.count || 0));
  }

  for (const category of existingCategories) {
    const bucket = ensureBucket(category.name);
    bucket.variants.add(category.name);
    bucket.sourceEntries.push({ source: "categoryCollection", category: category.name });
    for (const subcategory of category.subcategories) {
      addSubcategory(bucket, subcategory, "categoryCollection");
    }
  }

  return buckets;
};

const findSourceOnlyCategories = (sourceCategories, referenceCategories) => {
  const referenceSet = new Set(referenceCategories.map(normalizeKey));
  return sourceCategories.filter((name) => !referenceSet.has(normalizeKey(name)));
};

const detectPotentialVariants = (buckets) => {
  const names = [...buckets.values()].map((bucket) => ({
    normalized: bucket.normalizedCategory,
    variants: uniqueSorted([...bucket.variants]),
  }));

  const results = [];

  const looksRelated = (left, right) => {
    const a = normalizeKey(left);
    const b = normalizeKey(right);
    if (!a || !b || a === b) return false;
    if (a.includes(b) || b.includes(a)) return true;

    const tokensA = new Set(a.split(/[^a-z0-9]+/).filter(Boolean));
    const tokensB = new Set(b.split(/[^a-z0-9]+/).filter(Boolean));
    const overlap = [...tokensA].filter((token) => tokensB.has(token));
    return overlap.length > 0;
  };

  for (let index = 0; index < names.length; index += 1) {
    for (let inner = index + 1; inner < names.length; inner += 1) {
      const left = names[index];
      const right = names[inner];
      if (
        left.variants.some((variantLeft) =>
          right.variants.some((variantRight) => looksRelated(variantLeft, variantRight))
        )
      ) {
        results.push({
          left: left.variants,
          right: right.variants,
          reason: "token-or-substring-overlap",
        });
      }
    }
  }

  for (const [left, right] of AMBIGUOUS_RULES) {
    results.push({
      left: [left],
      right: [right],
      reason: "manual-rule",
    });
  }

  return results;
};

const buildCanonicalSuggestion = (bucket, existingCategoryMap, liveAdsCategoryCountMap) => {
  const existingExact = existingCategoryMap.get(bucket.normalizedCategory);
  if (existingExact) return existingExact.name;

  const variants = uniqueSorted([...bucket.variants]);
  if (variants.length === 1) return variants[0];

  const liveVariants = variants
    .map((variant) => ({
      variant,
      count: liveAdsCategoryCountMap.get(variant) || 0,
    }))
    .sort((a, b) => b.count - a.count || a.variant.localeCompare(b.variant));

  if (liveVariants[0]?.count > 0) return liveVariants[0].variant;

  const hardcodedPreferred = variants.find((variant) => variant === titleCaseFallback(variant));
  return hardcodedPreferred || variants[0];
};

const buildMigrationMapping = (buckets, existingCategories, liveAds) => {
  const mapping = {};
  const existingCategoryMap = new Map(
    existingCategories.map((category) => [normalizeKey(category.name), category])
  );
  const liveAdsCategoryCountMap = new Map(
    liveAds.categoryCounts.map((row) => [row.category, Number(row.count || 0)])
  );

  for (const bucket of [...buckets.values()].sort((a, b) =>
    a.normalizedCategory.localeCompare(b.normalizedCategory)
  )) {
    const canonicalName = buildCanonicalSuggestion(
      bucket,
      existingCategoryMap,
      liveAdsCategoryCountMap
    );

    const subcategories = {};
    for (const subBucket of [...bucket.subcategoryBuckets.values()].sort((a, b) =>
      a.normalizedSubcategory.localeCompare(b.normalizedSubcategory)
    )) {
      const variants = uniqueSorted([...subBucket.variants]);
      if (variants.length === 0) continue;

      if (
        variants.some((variant) => normalizeKey(variant) === "others") &&
        variants.some((variant) => normalizeKey(variant) === "other products")
      ) {
        for (const variant of variants) {
          subcategories[variant] = "__MANUAL_REVIEW__";
        }
        continue;
      }

      const canonicalSubcategory =
        variants.length === 1
          ? variants[0]
          : variants.find((variant) => variant === titleCaseFallback(variant)) || variants[0];

      for (const variant of variants) {
        subcategories[variant] = variant === canonicalSubcategory ? canonicalSubcategory : canonicalSubcategory;
      }
    }

    mapping[canonicalName] = {
      canonicalName,
      sourceVariants: uniqueSorted([...bucket.variants]),
      subcategories,
    };
  }

  return mapping;
};

const buildReport = ({ sourceMaps, liveAds, existingCategories }) => {
  const buckets = buildUnifiedBuckets({ sourceMaps, liveAds, existingCategories });

  const sourceCategoryNames = {
    createAd: sourceMaps.createAd.map((entry) => entry.category),
    adminAllAds: sourceMaps.adminAllAds.map((entry) => entry.category),
    categoryBar: sourceMaps.categoryBar.map((entry) => entry.category),
    liveAds: liveAds.distinctCategories,
    categoryCollection: existingCategories.map((entry) => entry.name),
  };

  const hardcodedUnion = uniqueSorted([
    ...sourceCategoryNames.createAd,
    ...sourceCategoryNames.adminAllAds,
    ...sourceCategoryNames.categoryBar,
  ]);

  const duplicateMatches = [...buckets.values()]
    .map((bucket) => {
      const variants = uniqueSorted([...bucket.variants]);
      const exactCaseVariants = variants.filter(
        (variant, index) => variants.indexOf(variant) !== index
      );
      const subcategoryDuplicates = [...bucket.subcategoryBuckets.values()]
        .map((subBucket) => ({
          normalizedSubcategory: subBucket.normalizedSubcategory,
          variants: uniqueSorted([...subBucket.variants]),
        }))
        .filter((entry) => entry.variants.length > 1);

      return {
        normalizedCategory: bucket.normalizedCategory,
        variants,
        subcategoryDuplicates,
      };
    })
    .filter((entry) => entry.variants.length > 1 || entry.subcategoryDuplicates.length > 0);

  const potentialVariants = detectPotentialVariants(buckets);

  const ambiguousMappings = potentialVariants.filter((entry) =>
    entry.left.some((left) =>
      entry.right.some((right) => normalizeKey(left) !== normalizeKey(right))
    )
  );

  const unifiedCategoryCandidates = [...buckets.values()]
    .sort((a, b) => a.normalizedCategory.localeCompare(b.normalizedCategory))
    .map((bucket) => ({
      normalizedCategory: bucket.normalizedCategory,
      sourceVariants: uniqueSorted([...bucket.variants]),
      liveAdCount: bucket.liveAdCount,
      subcategories: [...bucket.subcategoryBuckets.values()]
        .sort((a, b) => a.normalizedSubcategory.localeCompare(b.normalizedSubcategory))
        .map((subBucket) => ({
          normalizedSubcategory: subBucket.normalizedSubcategory,
          sourceVariants: uniqueSorted([...subBucket.variants]),
          liveAdCount: subBucket.liveAdCount,
          sources: uniqueSorted([...subBucket.sources]),
        })),
    }));

  const recommendedCanonicalNames = unifiedCategoryCandidates.map((candidate) => ({
    normalizedCategory: candidate.normalizedCategory,
    recommendedCanonicalName:
      candidate.sourceVariants.find((variant) => variant === titleCaseFallback(variant)) ||
      candidate.sourceVariants[0] ||
      candidate.normalizedCategory,
    variants: candidate.sourceVariants,
  }));

  return {
    generatedAt: new Date().toISOString(),
    readOnly: true,
    sourceFiles: SOURCE_FILES,
    databaseSummary: {
      adCount: liveAds.adCount,
      categoryDocumentCount: existingCategories.length,
      emptyCategoryCount: liveAds.emptyCategoryCount,
      emptySubcategoryCount: liveAds.emptySubcategoryCount,
    },
    categoriesBySource: {
      createAd: sourceMaps.createAd,
      adminAllAds: sourceMaps.adminAllAds,
      categoryBar: sourceMaps.categoryBar,
      liveAds: liveAds.categoryCounts,
      categoryCollection: existingCategories,
    },
    liveAds: {
      distinctCategories: liveAds.distinctCategories,
      distinctCategorySubcategoryPairs: liveAds.distinctPairs,
      categoryCounts: liveAds.categoryCounts,
      categorySubcategoryCounts: liveAds.pairCounts,
      emptyCategoryCount: liveAds.emptyCategoryCount,
      emptySubcategoryCount: liveAds.emptySubcategoryCount,
    },
    comparison: {
      categoriesPresentInHardcodedSourcesButAbsentFromAds: findSourceOnlyCategories(
        hardcodedUnion,
        sourceCategoryNames.liveAds
      ),
      categoriesPresentInAdsButAbsentFromHardcodedSources: findSourceOnlyCategories(
        sourceCategoryNames.liveAds,
        hardcodedUnion
      ),
      categoriesPresentInAdsButAbsentFromCategoryCollection: findSourceOnlyCategories(
        sourceCategoryNames.liveAds,
        sourceCategoryNames.categoryCollection
      ),
    },
    unifiedCategoryCandidates,
    duplicateMatches,
    potentialNameVariants: potentialVariants,
    ambiguousMappingsRequiringManualApproval: ambiguousMappings,
    recommendedCanonicalNames,
    migrationMapping: buildMigrationMapping(buckets, existingCategories, liveAds),
  };
};

const printSummary = (report) => {
  console.log("Category migration audit complete.");
  console.log("Read-only mode: yes");
  console.log(`Ads scanned: ${report.databaseSummary.adCount}`);
  console.log(
    `Existing Category documents: ${report.databaseSummary.categoryDocumentCount}`
  );
  console.log(
    `Hardcoded-only categories absent from ads: ${report.comparison.categoriesPresentInHardcodedSourcesButAbsentFromAds.length}`
  );
  console.log(
    `Ad categories absent from hardcoded sources: ${report.comparison.categoriesPresentInAdsButAbsentFromHardcodedSources.length}`
  );
  console.log(
    `Ambiguous mappings needing manual approval: ${report.ambiguousMappingsRequiringManualApproval.length}`
  );

  if (report.comparison.categoriesPresentInHardcodedSourcesButAbsentFromAds.length > 0) {
    console.log("Hardcoded-only categories:");
    for (const value of report.comparison.categoriesPresentInHardcodedSourcesButAbsentFromAds) {
      console.log(`- ${value}`);
    }
  }

  if (report.comparison.categoriesPresentInAdsButAbsentFromHardcodedSources.length > 0) {
    console.log("Ad-only categories:");
    for (const value of report.comparison.categoriesPresentInAdsButAbsentFromHardcodedSources) {
      console.log(`- ${value}`);
    }
  }

  console.log("Top live ad categories:");
  for (const row of report.liveAds.categoryCounts.slice(0, 10)) {
    console.log(`- ${row.category}: ${row.count}`);
  }

  console.log("Ambiguous mappings:");
  for (const entry of report.ambiguousMappingsRequiringManualApproval) {
    console.log(
      `- ${entry.left.join(" / ")}  <->  ${entry.right.join(" / ")} (${entry.reason})`
    );
  }

  console.log(`JSON report written to: ${REPORT_PATH}`);
};

const main = async () => {
  await connectDB();

  try {
    const [hardcodedSources, liveAds, existingCategories] = await Promise.all([
      readHardcodedSources(),
      getLiveAdData(),
      getExistingCategoryData(),
    ]);

    const sourceMaps = {
      createAd: normalizeSourceCategoryMap(hardcodedSources.createAd, "createAd"),
      adminAllAds: normalizeSourceCategoryMap(
        hardcodedSources.adminAllAds,
        "adminAllAds"
      ),
      categoryBar: normalizeSourceCategoryMap(hardcodedSources.categoryBar, "categoryBar"),
    };

    const report = buildReport({
      sourceMaps,
      liveAds,
      existingCategories,
    });

    await fs.mkdir(REPORTS_DIR, { recursive: true });
    await fs.writeFile(REPORT_PATH, JSON.stringify(report, null, 2), "utf8");

    printSummary(report);
  } finally {
    await mongoose.connection.close();
  }
};

main().catch(async (error) => {
  console.error("Category migration audit failed:", serializeError(error));
  try {
    await mongoose.connection.close();
  } catch {}
  process.exit(1);
});
