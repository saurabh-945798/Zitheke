import { z } from "zod";
import { ALLOWED_PREMIUM_PLAN_AMOUNTS } from "../constants/membershipPlans.js";

export const planSlugParamSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(2, "Plan slug is required")
    .max(80, "Plan slug is too long"),
});

export const planIdParamSchema = z.object({
  id: z
    .string()
    .trim()
    .regex(/^[a-f\d]{24}$/i, "Valid plan id is required"),
});

const planNameSchema = z
  .string()
  .trim()
  .min(2, "Plan name is required")
  .max(80, "Plan name is too long");

const planSlugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(2, "Plan slug is required")
  .max(80, "Plan slug is too long")
  .regex(
    /^[a-z0-9-]+$/,
    "Plan slug can only contain lowercase letters, numbers, and hyphens"
  );

const featureSchema = z
  .string()
  .trim()
  .min(1, "Feature cannot be empty")
  .max(160, "Feature is too long");

const priceSchema = z.coerce
  .number()
  .refine(
    (value) => value === 0 || ALLOWED_PREMIUM_PLAN_AMOUNTS.includes(value),
    {
      message: `Price must be 0 or one of the allowed premium amounts: ${ALLOWED_PREMIUM_PLAN_AMOUNTS.join(", ")} MWK`,
    }
  );

export const createPlanSchema = z.object({
  name: planNameSchema,
  slug: planSlugSchema,
  price: priceSchema,
  currency: z
    .string()
    .trim()
    .toUpperCase()
    .min(3, "Currency is required")
    .max(10, "Currency is too long"),
  durationDays: z.coerce
    .number()
    .int()
    .min(0, "durationDays must be 0 or greater"),
  features: z.array(featureSchema).default([]),
  isActive: z.boolean().optional(),
  priorityLevel: z.coerce
    .number()
    .int()
    .min(0, "priorityLevel must be 0 or greater"),
});

export const updatePlanSchema = createPlanSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required to update a plan",
  });
