import mongoose from "mongoose";
import {
  SUBSCRIPTION_STATUSES,
  SUBSCRIPTION_STATUS_VALUES,
} from "../constants/subscriptionStatuses.js";

const subscriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plan",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: SUBSCRIPTION_STATUS_VALUES,
      default: SUBSCRIPTION_STATUSES.PENDING,
      index: true,
    },
    startDate: {
      type: Date,
      default: null,
    },
    endDate: {
      type: Date,
      default: null,
    },
    activatedAt: {
      type: Date,
      default: null,
    },
    expiredAt: {
      type: Date,
      default: null,
    },
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
      default: null,
    },
    autoDowngraded: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

subscriptionSchema.index({ userId: 1, status: 1, createdAt: -1 });
subscriptionSchema.index({ status: 1, endDate: 1 });
subscriptionSchema.index(
  { userId: 1, status: 1 },
  {
    unique: true,
    partialFilterExpression: { status: SUBSCRIPTION_STATUSES.ACTIVE },
  }
);

const Subscription = mongoose.model("Subscription", subscriptionSchema);
export default Subscription;
