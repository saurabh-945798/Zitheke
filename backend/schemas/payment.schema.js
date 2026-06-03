import { z } from "zod";
import { PAYMENT_GATEWAY_VALUES } from "../constants/paymentGateways.js";

const objectIdRegex = /^[a-f\d]{24}$/i;

export const createPaymentIntentSchema = z.object({
  subscriptionId: z
    .string()
    .trim()
    .regex(objectIdRegex, "Valid subscriptionId is required"),
  gateway: z.enum(PAYMENT_GATEWAY_VALUES),
  paymentMethod: z
    .string()
    .trim()
    .min(2, "paymentMethod is required")
    .max(60, "paymentMethod is too long"),
  msisdn: z
    .string()
    .trim()
    .min(8, "msisdn is required")
    .max(20, "msisdn is too long"),
  idempotencyKey: z
    .string()
    .trim()
    .min(8, "idempotencyKey must be at least 8 characters")
    .max(128, "idempotencyKey is too long")
    .optional(),
});

export const paymentIdParamSchema = z.object({
  paymentId: z
    .string()
    .trim()
    .regex(objectIdRegex, "Valid paymentId is required"),
});
