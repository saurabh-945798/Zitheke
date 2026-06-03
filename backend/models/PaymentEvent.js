import mongoose from "mongoose";

const paymentEventSchema = new mongoose.Schema(
  {
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
      required: true,
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

paymentEventSchema.index({ paymentId: 1, processedAt: -1 });
paymentEventSchema.index({ eventType: 1, processedAt: -1 });

const PaymentEvent = mongoose.model("PaymentEvent", paymentEventSchema);
export default PaymentEvent;
