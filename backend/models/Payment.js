import mongoose from "mongoose";
import {
  PAYMENT_STATUS_VALUES,
  PAYMENT_STATUSES,
} from "../constants/paymentStatuses.js";
import {
  PAYMENT_VERIFICATION_STATUS_VALUES,
  PAYMENT_VERIFICATION_STATUSES,
} from "../constants/paymentVerificationStatuses.js";
import { PAYMENT_GATEWAY_VALUES } from "../constants/paymentGateways.js";

const paymentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    subscriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subscription",
      required: true,
      index: true,
    },
    gateway: {
      type: String,
      enum: PAYMENT_GATEWAY_VALUES,
      required: true,
      index: true,
    },
    paymentMethod: {
      type: String,
      required: true,
      trim: true,
      maxlength: 60,
    },
    payerMsisdn: {
      type: String,
      default: "",
      trim: true,
      maxlength: 20,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      required: true,
      default: "MWK",
      uppercase: true,
      trim: true,
      maxlength: 10,
    },
    merchantTransactionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
      maxlength: 120,
    },
    gatewayTransactionId: {
      type: String,
      default: "",
      trim: true,
      maxlength: 160,
    },
    gatewaySessionId: {
      type: String,
      default: "",
      trim: true,
      maxlength: 200,
    },
    gatewayOrderId: {
      type: String,
      default: "",
      trim: true,
      maxlength: 160,
    },
    status: {
      type: String,
      enum: PAYMENT_STATUS_VALUES,
      default: PAYMENT_STATUSES.CREATED,
      index: true,
    },
    verificationStatus: {
      type: String,
      enum: PAYMENT_VERIFICATION_STATUS_VALUES,
      default: PAYMENT_VERIFICATION_STATUSES.UNVERIFIED,
      index: true,
    },
    rawRequestPayload: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    rawResponsePayload: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    retryCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    idempotencyKey: {
      type: String,
      default: "",
      trim: true,
      maxlength: 128,
    },
    failureReason: {
      type: String,
      default: "",
      trim: true,
      maxlength: 500,
    },
    gatewayCode: {
      type: String,
      default: "",
      trim: true,
      maxlength: 80,
    },
    gatewayMessage: {
      type: String,
      default: "",
      trim: true,
      maxlength: 500,
    },
    lastVerificationAttemptAt: {
      type: Date,
      default: null,
    },
    rawVerificationResponse: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    paidAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

paymentSchema.index({ subscriptionId: 1, createdAt: -1 });
paymentSchema.index({ userId: 1, createdAt: -1 });
paymentSchema.index(
  { idempotencyKey: 1 },
  {
    unique: true,
    partialFilterExpression: { idempotencyKey: { $type: "string", $ne: "" } },
  }
);

const Payment = mongoose.model("Payment", paymentSchema);
export default Payment;
