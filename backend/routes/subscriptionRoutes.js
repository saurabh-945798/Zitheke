import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import {
  createSubscription,
  getCurrentSubscription,
  getSubscriptionHistory,
  getMembershipAccess,
} from "../Controllers/subscriptionController.js";
import { validate } from "../middlewares/validate.js";
import { createSubscriptionSchema } from "../schemas/subscription.schema.js";

const router = express.Router();

router.post("/", authMiddleware, validate(createSubscriptionSchema, "body"), createSubscription);
router.get("/me/access", authMiddleware, getMembershipAccess);
router.get("/me/current", authMiddleware, getCurrentSubscription);
router.get("/me/history", authMiddleware, getSubscriptionHistory);

export default router;
