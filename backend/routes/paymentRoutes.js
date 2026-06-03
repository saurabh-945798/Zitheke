import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import {
  createPaymentIntent,
  getPaymentById,
  getPaymentHistory,
  verifyPayment,
} from "../Controllers/paymentController.js";
import { validate } from "../middlewares/validate.js";
import {
  createPaymentIntentSchema,
  paymentIdParamSchema,
} from "../schemas/payment.schema.js";

const router = express.Router();

router.post("/", authMiddleware, validate(createPaymentIntentSchema, "body"), createPaymentIntent);
router.post("/:paymentId/verify", authMiddleware, validate(paymentIdParamSchema, "params"), verifyPayment);
router.get("/me/history", authMiddleware, getPaymentHistory);
router.get("/:paymentId", authMiddleware, validate(paymentIdParamSchema, "params"), getPaymentById);

export default router;
