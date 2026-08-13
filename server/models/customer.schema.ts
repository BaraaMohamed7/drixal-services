import { defineMongooseModel } from "#nuxt/mongoose";
import mongoose from "mongoose";

export const customerStatusValues = ["ACTIVE", "INACTIVE"] as const;

export const Customer = defineMongooseModel({
  name: "Customer",
  schema: {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },
    city: {
      type: String,
      default: "",
      trim: true,
    },
    status: {
      type: String,
      enum: customerStatusValues,
      default: "ACTIVE",
    },
  },
  options: {
    collection: "customers",
    timestamps: true,
  },
  hooks(schema) {
    schema.index({ companyId: 1, phone: 1 }, { unique: true });
    schema.index({ companyId: 1, name: 1 });
  },
});
