import mongoose from "mongoose";

const subscriptionEventSchema = new mongoose.Schema(
  {
    subscriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subscription",
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
      default: null,
      index: true,
    },
    eventType: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    source: {
      type: String,
      default: "system",
      trim: true,
      maxlength: 60,
    },
    rawPayload: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    normalizedPayload: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    processedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

subscriptionEventSchema.index({ subscriptionId: 1, processedAt: -1 });
subscriptionEventSchema.index({ userId: 1, processedAt: -1 });
subscriptionEventSchema.index({ eventType: 1, processedAt: -1 });

const SubscriptionEvent = mongoose.model(
  "SubscriptionEvent",
  subscriptionEventSchema
);

export default SubscriptionEvent;
