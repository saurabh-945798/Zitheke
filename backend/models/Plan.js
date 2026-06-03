import mongoose from "mongoose";

const planSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 80,
    },
    price: {
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
    durationDays: {
      type: Number,
      required: true,
      min: 0,
    },
    features: {
      type: [String],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    priorityLevel: {
      type: Number,
      default: 0,
      index: true,
    },
  },
  { timestamps: true }
);

planSchema.index({ slug: 1 }, { unique: true });
planSchema.index({ isActive: 1, priorityLevel: -1, price: 1, durationDays: 1 });

const Plan = mongoose.model("Plan", planSchema);
export default Plan;
