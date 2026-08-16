import { defineMongooseModel } from "#nuxt/mongoose";
import mongoose from "mongoose";

export const pricingTypeValues = ["FIXED", "HOURLY", "CUSTOM"] as const;
export const locationTypeValues = ["PROVIDER", "CUSTOMER", "REMOTE", "FLEXIBLE"] as const;
export const operationalStatusValues = ["ACTIVE", "INACTIVE"] as const;
export const publicationStatusValues = ["DRAFT", "PUBLISHED", "UNPUBLISHED"] as const;

export type PricingType = (typeof pricingTypeValues)[number];
export type LocationType = (typeof locationTypeValues)[number];
export type OperationalStatus = (typeof operationalStatusValues)[number];
export type PublicationStatus = (typeof publicationStatusValues)[number];

export interface ServiceDocument {
  _id: mongoose.Types.ObjectId;
  companyId: mongoose.Types.ObjectId;
  categoryId: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  description: string;
  pricing: {
    type: PricingType;
    amount?: number;
    currency: string;
  };
  duration?: number;
  locationType: LocationType;
  scheduling: {
    required: boolean;
  };
  operationalStatus: OperationalStatus;
  publicationStatus: PublicationStatus;
  createdAt: Date;
  updatedAt: Date;
}

export const Service = defineMongooseModel<ServiceDocument>({
  name: "Service",
  schema: {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ServiceCategory",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    pricing: {
      type: {
        type: String,
        enum: pricingTypeValues,
        default: "FIXED",
      },
      amount: {
        type: Number,
        min: 0,
      },
      currency: {
        type: String,
        default: "EGP",
        uppercase: true,
        trim: true,
      },
    },
    duration: {
      type: Number,
      min: 0,
    },
    locationType: {
      type: String,
      enum: locationTypeValues,
      default: "FLEXIBLE",
    },
    scheduling: {
      required: {
        type: Boolean,
        default: false,
      },
    },
    operationalStatus: {
      type: String,
      enum: operationalStatusValues,
      default: "ACTIVE",
    },
    publicationStatus: {
      type: String,
      enum: publicationStatusValues,
      default: "DRAFT",
    },
  },
  options: {
    collection: "services",
    timestamps: true,
  },
  hooks(schema) {
    schema.index({ companyId: 1, publicationStatus: 1 });
    schema.index({ categoryId: 1, publicationStatus: 1 });
    schema.index({ slug: 1 });
    schema.index({ companyId: 1, slug: 1 }, { unique: true });
    schema.index({ name: "text", description: "text" });
  },
});
