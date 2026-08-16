import { defineMongooseModel } from "#nuxt/mongoose";

export const companyStatusValues = ["PENDING", "APPROVED", "REJECTED", "SUSPENDED"] as const;
export type CompanyStatus = (typeof companyStatusValues)[number];

export interface CompanyDocument {
  _id: import("mongoose").Types.ObjectId;
  name: string;
  slug: string;
  description: string;
  status: CompanyStatus;
  location: {
    city: string;
    area: string;
  };
  rating: number;
  createdAt: Date;
  updatedAt: Date;
}

export const Company = defineMongooseModel<CompanyDocument>({
  name: "Company",
  schema: {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    status: {
      type: String,
      enum: companyStatusValues,
      default: "PENDING",
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
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
  },
  options: {
    collection: "companies",
    timestamps: true,
  },
  hooks(schema) {
    schema.index({ status: 1 });
  },
});
