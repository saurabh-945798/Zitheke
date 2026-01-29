// src/schemas/otp.schema.js
import { z } from "zod";

const phoneSchema = z
  .string()
  .trim()
  .min(10, "Phone is required")
  .max(12, "Phone too long")
  .regex(/^(\+?265)\d{7,9}$/, "Use phone number with country code like 265XXXXXXXXX");

export const sendOtpSchema = z.object({
  phone: phoneSchema,
});

export const verifyOtpSchema = z.object({
  phone: phoneSchema,
  otp: z.string().trim().length(6, "OTP must be 6 digits"),
});
