import { defineMongooseModel } from "#nuxt/mongoose";
import mongoose from "mongoose";

export const customerStatusValues = ["ACTIVE", "INACTIVE"] as const;
export type CustomerStatus = (typeof customerStatusValues)[number];

export interface CustomerDocument {
  _id: mongoose.Types.ObjectId;
  companyId: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  name: string;
  phone: string;
  email: string;
  city: string;
  status: CustomerStatus;
  createdAt: Date;
  updatedAt: Date;
}

export const Customer = defineMongooseModel<CustomerDocument>({
  name: "Customer",
  schema: {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
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
    schema.index({ companyId: 1, userId: 1 }, { unique: true, partialFilterExpression: { userId: { $type: "objectId" } } });
    schema.index({ userId: 1, updatedAt: -1 });
  },
});
