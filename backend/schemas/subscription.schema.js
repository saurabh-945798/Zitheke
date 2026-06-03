import { z } from "zod";

const objectIdRegex = /^[a-f\d]{24}$/i;

export const createSubscriptionSchema = z.object({
  planId: z
    .string()
    .trim()
    .regex(objectIdRegex, "Valid planId is required"),
});
