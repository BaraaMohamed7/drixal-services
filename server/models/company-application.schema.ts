import { defineMongooseModel } from "#nuxt/mongoose";
import mongoose from "mongoose";

export const companyApplicationStatusValues = ["PENDING", "APPROVED", "REJECTED"] as const;
export type CompanyApplicationStatus = (typeof companyApplicationStatusValues)[number];

export interface CompanyApplicationDocument {
  _id: mongoose.Types.ObjectId;
  applicantUserId: mongoose.Types.ObjectId;
  companyName: string;
  companySlug: string;
  description: string;
  location: {
    city: string;
    area: string;
  };
  status: CompanyApplicationStatus;
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const CompanyApplication = defineMongooseModel<CompanyApplicationDocument>({
  name: "CompanyApplication",
  schema: {
    applicantUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    companyName: {
      type: String,
      required: true,
      trim: true,
    },
    companySlug: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    location: {
      city: {
        type: String,
        default: "",
        trim: true,
      },
      area: {
        type: String,
        default: "",
        trim: true,
      },
    },
    status: {
      type: String,
      enum: companyApplicationStatusValues,
      default: "PENDING",
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    reviewedAt: {
      type: Date,
    },
    rejectionReason: {
      type: String,
      trim: true,
    },
  },
  options: {
    collection: "company_applications",
    timestamps: true,
  },
  hooks(schema) {
    schema.index({ applicantUserId: 1 });
    schema.index({ status: 1 });
    schema.index({ companySlug: 1 });
  },
});
