// src/schemas/otp.schema.js
import { z } from "zod";

const phoneSchema = z
  .string()
  .trim()
  .min(7, "Phone is required")
  .max(16, "Phone too long")
  .regex(/^[\d+\s]+$/, "Invalid phone number format");

export const sendOtpSchema = z.object({
  phone: phoneSchema,
  captchaToken: z.string().trim().optional(),
});

export const verifyOtpSchema = z.object({
  phone: phoneSchema,
  otp: z.string().trim().length(6, "OTP must be 6 digits"),
});
