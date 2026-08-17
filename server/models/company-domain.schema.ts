import { defineMongooseModel } from "#nuxt/mongoose";
import mongoose from "mongoose";

export const companyDomainTypeValues = ["SUBDOMAIN", "CUSTOM"] as const;
export type CompanyDomainType = (typeof companyDomainTypeValues)[number];

export const companyDomainStatusValues = ["PENDING", "VERIFYING", "VERIFIED", "FAILED", "DISABLED"] as const;
export type CompanyDomainStatus = (typeof companyDomainStatusValues)[number];

export const reservedSubdomains = ["www", "api", "auth", "admin", "app", "support", "drixal"];

export interface CompanyDomainDocument {
  _id: mongoose.Types.ObjectId;
  companyId: mongoose.Types.ObjectId;
  hostname: string;
  normalizedHostname: string;
  type: CompanyDomainType;
  status: CompanyDomainStatus;
  isPrimary: boolean;
  verificationToken?: string;
  verifiedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export const CompanyDomain = defineMongooseModel<CompanyDomainDocument>({
  name: "CompanyDomain",
  schema: {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    hostname: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    normalizedHostname: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    type: {
      type: String,
      enum: companyDomainTypeValues,
      required: true,
    },
    status: {
      type: String,
      enum: companyDomainStatusValues,
      default: "PENDING",
    },
    isPrimary: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
    },
    verifiedAt: {
      type: Date,
    },
  },
  options: {
    collection: "company_domains",
    timestamps: true,
  },
  hooks(schema) {
    schema.index({ companyId: 1 });
    schema.index({ normalizedHostname: 1 }, { unique: true });
    schema.index({ companyId: 1, isPrimary: 1 });
  },
});
