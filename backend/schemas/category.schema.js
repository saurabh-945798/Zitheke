import { z } from "zod";

const objectIdRegex = /^[a-f\d]{24}$/i;

const nameSchema = z
  .string()
  .trim()
  .min(2, "Name is required")
  .max(120, "Name is too long");

const keywordSchema = z
  .string()
  .trim()
  .min(1, "Keyword cannot be empty")
  .max(80, "Keyword is too long");

export const categoryIdParamSchema = z.object({
  categoryId: z
    .string()
    .trim()
    .regex(objectIdRegex, "Valid category id is required"),
});

export const subcategoryIdParamSchema = z.object({
  categoryId: z
    .string()
    .trim()
    .regex(objectIdRegex, "Valid category id is required"),
  subcategoryId: z
    .string()
    .trim()
    .regex(objectIdRegex, "Valid subcategory id is required"),
});

export const listCategoriesQuerySchema = z.object({
  search: z.string().trim().max(120, "Search is too long").optional(),
  status: z.enum(["active", "inactive"]).optional(),
});

export const createCategorySchema = z.object({
  name: nameSchema,
  keywords: z.array(keywordSchema).default([]),
});

export const updateCategorySchema = z
  .object({
    name: nameSchema.optional(),
    keywords: z.array(keywordSchema).optional(),
    isActive: z.boolean().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required to update a category",
  });

export const categoryStatusSchema = z.object({
  isActive: z.boolean(),
});

export const createSubcategorySchema = z.object({
  name: nameSchema,
});

export const updateSubcategorySchema = z
  .object({
    name: nameSchema.optional(),
    isActive: z.boolean().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required to update a subcategory",
  });

export const subcategoryStatusSchema = z.object({
  isActive: z.boolean(),
});
