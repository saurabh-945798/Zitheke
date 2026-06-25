import mongoose from "mongoose";
import Category from "../models/Category.js";
import Ad from "../models/Ad.js";

const createError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const handleError = (res, error, fallbackMessage) =>
  res.status(error?.statusCode || 500).json({
    success: false,
    message: error?.message || fallbackMessage,
  });

const escapeRegex = (value = "") =>
  String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const slugify = (value = "") =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
    .slice(0, 140);

const normalizeKeywords = (keywords = []) =>
  Array.isArray(keywords)
    ? keywords.map((keyword) => String(keyword).trim()).filter(Boolean)
    : [];

const assertValidObjectId = (value, label) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw createError(400, `Invalid ${label}`);
  }
};

const findCategoryById = async (categoryId) => {
  assertValidObjectId(categoryId, "categoryId");
  const category = await Category.findById(categoryId);
  if (!category) {
    throw createError(404, "Category not found");
  }
  return category;
};

const ensureUniqueCategoryName = async (name, excludeId = null) => {
  const existing = await Category.findOne({
    name: { $regex: `^${escapeRegex(name)}$`, $options: "i" },
    ...(excludeId ? { _id: { $ne: excludeId } } : {}),
  }).select("_id name");

  if (existing) {
    throw createError(409, "Category name already exists");
  }
};

const ensureUniqueCategorySlug = async (slug, excludeId = null) => {
  const existing = await Category.findOne({
    slug,
    ...(excludeId ? { _id: { $ne: excludeId } } : {}),
  }).select("_id slug");

  if (existing) {
    throw createError(409, "Category slug already exists");
  }
};

const getSubcategoryIndex = (category, subcategoryId) => {
  const index = category.subcategories.findIndex(
    (subcategory) => String(subcategory._id) === String(subcategoryId)
  );

  if (index === -1) {
    throw createError(404, "Subcategory not found");
  }

  return index;
};

const ensureUniqueSubcategoryIdentity = ({
  category,
  name,
  slug,
  excludeSubcategoryId = null,
}) => {
  const duplicate = category.subcategories.find((subcategory) => {
    if (
      excludeSubcategoryId &&
      String(subcategory._id) === String(excludeSubcategoryId)
    ) {
      return false;
    }

    const sameName =
      String(subcategory.name || "").trim().toLowerCase() ===
      String(name || "").trim().toLowerCase();
    const sameSlug =
      String(subcategory.slug || "").trim().toLowerCase() ===
      String(slug || "").trim().toLowerCase();

    return sameName || sameSlug;
  });

  if (duplicate) {
    throw createError(
      409,
      "Subcategory name or slug already exists in this category"
    );
  }
};

const buildCategoryFilters = ({ search = "", status = "" }) => {
  const filters = {};

  const trimmedSearch = String(search || "").trim();
  if (trimmedSearch) {
    filters.$or = [
      { name: { $regex: trimmedSearch, $options: "i" } },
      { slug: { $regex: trimmedSearch, $options: "i" } },
      { keywords: { $regex: trimmedSearch, $options: "i" } },
      { "subcategories.name": { $regex: trimmedSearch, $options: "i" } },
      { "subcategories.slug": { $regex: trimmedSearch, $options: "i" } },
    ];
  }

  if (status === "active") filters.isActive = true;
  if (status === "inactive") filters.isActive = false;

  return filters;
};

export const listAdminCategories = async (req, res) => {
  try {
    const query = req.validated?.query || req.query;
    const categories = await Category.find(buildCategoryFilters(query))
      .sort({ name: 1, createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      categories,
    });
  } catch (error) {
    console.error("Error listing admin categories:", error);
    return handleError(res, error, "Failed to fetch categories");
  }
};

export const listPublicCategories = async (req, res) => {
  try {
    const categories = await Category.find(
      { isActive: true },
      {
        name: 1,
        slug: 1,
        subcategories: 1,
      }
    )
      .sort({ name: 1, createdAt: -1 })
      .lean();

    const safeCategories = categories.map((category) => ({
      _id: category._id,
      name: category.name,
      slug: category.slug,
      subcategories: Array.isArray(category.subcategories)
        ? category.subcategories
            .filter((subcategory) => subcategory?.isActive)
            .map((subcategory) => ({
              _id: subcategory._id,
              name: subcategory.name,
              slug: subcategory.slug,
            }))
        : [],
    }));

    return res.status(200).json({
      success: true,
      categories: safeCategories,
    });
  } catch (error) {
    console.error("Error listing public categories:", error);
    return handleError(res, error, "Failed to fetch categories");
  }
};

export const createAdminCategory = async (req, res) => {
  try {
    const payload = req.validated?.body || req.body;
    const name = String(payload.name || "").trim();
    const slug = slugify(name);

    if (!slug) {
      throw createError(400, "Category slug could not be generated safely");
    }

    await ensureUniqueCategoryName(name);
    await ensureUniqueCategorySlug(slug);

    const category = await Category.create({
      name,
      slug,
      keywords: normalizeKeywords(payload.keywords),
      isActive: true,
      subcategories: [],
    });

    return res.status(201).json({
      success: true,
      message: "Category created successfully",
      category,
    });
  } catch (error) {
    console.error("Error creating category:", error);
    return handleError(res, error, "Failed to create category");
  }
};

export const updateAdminCategory = async (req, res) => {
  try {
    const { categoryId } = req.validated?.params || req.params;
    const payload = req.validated?.body || req.body;
    const category = await findCategoryById(categoryId);

    if (payload.name !== undefined) {
      const nextName = String(payload.name || "").trim();
      const nextSlug = slugify(nextName);

      if (!nextSlug) {
        throw createError(400, "Category slug could not be generated safely");
      }

      await ensureUniqueCategoryName(nextName, category._id);
      await ensureUniqueCategorySlug(nextSlug, category._id);

      category.name = nextName;
      category.slug = nextSlug;
      // Ads currently store category as a plain string, so category rename does not
      // migrate existing ads automatically. Any ad category migration must be handled separately.
    }

    if (payload.keywords !== undefined) {
      category.keywords = normalizeKeywords(payload.keywords);
    }

    if (payload.isActive !== undefined) {
      category.isActive = Boolean(payload.isActive);
    }

    await category.save();

    return res.status(200).json({
      success: true,
      message: "Category updated successfully",
      category,
    });
  } catch (error) {
    console.error("Error updating category:", error);
    return handleError(res, error, "Failed to update category");
  }
};

export const updateAdminCategoryStatus = async (req, res) => {
  try {
    const { categoryId } = req.validated?.params || req.params;
    const { isActive } = req.validated?.body || req.body;
    const category = await findCategoryById(categoryId);

    category.isActive = Boolean(isActive);
    await category.save();

    return res.status(200).json({
      success: true,
      message: `Category ${category.isActive ? "activated" : "deactivated"} successfully`,
      category,
    });
  } catch (error) {
    console.error("Error updating category status:", error);
    return handleError(res, error, "Failed to update category status");
  }
};

export const addAdminSubcategory = async (req, res) => {
  try {
    const { categoryId } = req.validated?.params || req.params;
    const { name } = req.validated?.body || req.body;
    const category = await findCategoryById(categoryId);
    const trimmedName = String(name || "").trim();
    const slug = slugify(trimmedName);

    if (!slug) {
      throw createError(400, "Subcategory slug could not be generated safely");
    }

    ensureUniqueSubcategoryIdentity({
      category,
      name: trimmedName,
      slug,
    });

    category.subcategories.push({
      name: trimmedName,
      slug,
      isActive: true,
    });

    await category.save();

    return res.status(201).json({
      success: true,
      message: "Subcategory added successfully",
      category,
    });
  } catch (error) {
    console.error("Error adding subcategory:", error);
    return handleError(res, error, "Failed to add subcategory");
  }
};

export const updateAdminSubcategory = async (req, res) => {
  try {
    const { categoryId, subcategoryId } = req.validated?.params || req.params;
    const payload = req.validated?.body || req.body;
    const category = await findCategoryById(categoryId);
    const index = getSubcategoryIndex(category, subcategoryId);
    const subcategory = category.subcategories[index];

    if (payload.name !== undefined) {
      const nextName = String(payload.name || "").trim();
      const nextSlug = slugify(nextName);

      if (!nextSlug) {
        throw createError(400, "Subcategory slug could not be generated safely");
      }

      ensureUniqueSubcategoryIdentity({
        category,
        name: nextName,
        slug: nextSlug,
        excludeSubcategoryId: subcategoryId,
      });

      subcategory.name = nextName;
      subcategory.slug = nextSlug;
      // Ads currently store subcategory as a plain string, so subcategory rename does not
      // migrate existing ads automatically. Any ad subcategory migration must be handled separately.
    }

    if (payload.isActive !== undefined) {
      subcategory.isActive = Boolean(payload.isActive);
    }

    category.markModified("subcategories");
    await category.save();

    return res.status(200).json({
      success: true,
      message: "Subcategory updated successfully",
      category,
    });
  } catch (error) {
    console.error("Error updating subcategory:", error);
    return handleError(res, error, "Failed to update subcategory");
  }
};

export const updateAdminSubcategoryStatus = async (req, res) => {
  try {
    const { categoryId, subcategoryId } = req.validated?.params || req.params;
    const { isActive } = req.validated?.body || req.body;
    const category = await findCategoryById(categoryId);
    const index = getSubcategoryIndex(category, subcategoryId);

    category.subcategories[index].isActive = Boolean(isActive);
    category.markModified("subcategories");
    await category.save();

    return res.status(200).json({
      success: true,
      message: `Subcategory ${isActive ? "activated" : "deactivated"} successfully`,
      category,
    });
  } catch (error) {
    console.error("Error updating subcategory status:", error);
    return handleError(res, error, "Failed to update subcategory status");
  }
};

export const deleteAdminCategory = async (req, res) => {
  try {
    const { categoryId } = req.validated?.params || req.params;
    const category = await findCategoryById(categoryId);

    const linkedAdExists = await Ad.exists({
      category: category.name,
    });

    if (linkedAdExists) {
      throw createError(
        409,
        "Cannot delete this category because existing ads are using it. Deactivate it instead."
      );
    }

    await Category.deleteOne({ _id: category._id });

    return res.status(200).json({
      success: true,
      message: "Category deleted successfully",
      deleted: true,
      id: String(category._id),
    });
  } catch (error) {
    console.error("Error deleting category:", error);
    return handleError(res, error, "Failed to delete category");
  }
};

export const deleteAdminSubcategory = async (req, res) => {
  try {
    const { categoryId, subcategoryId } = req.validated?.params || req.params;
    const category = await findCategoryById(categoryId);
    const index = getSubcategoryIndex(category, subcategoryId);
    const subcategory = category.subcategories[index];

    const linkedAdExists = await Ad.exists({
      category: category.name,
      subcategory: subcategory.name,
    });

    if (linkedAdExists) {
      throw createError(
        409,
        "Cannot delete this subcategory because existing ads are using it. Deactivate it instead."
      );
    }

    category.subcategories.splice(index, 1);
    category.markModified("subcategories");
    await category.save();

    return res.status(200).json({
      success: true,
      message: "Subcategory deleted successfully",
      category,
    });
  } catch (error) {
    console.error("Error deleting subcategory:", error);
    return handleError(res, error, "Failed to delete subcategory");
  }
};
