import { defineMongooseModel } from "#nuxt/mongoose";

export interface ServiceCategoryDocument {
  _id: import("mongoose").Types.ObjectId;
  name: string;
  slug: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const ServiceCategory = defineMongooseModel<ServiceCategoryDocument>({
  name: "ServiceCategory",
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
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  options: {
    collection: "service_categories",
    timestamps: true,
  },
  hooks(schema) {
    schema.index({ isActive: 1, name: 1 });
  },
});
