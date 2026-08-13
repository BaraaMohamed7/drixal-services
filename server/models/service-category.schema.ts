import { defineMongooseModel } from "#nuxt/mongoose";

export const ServiceCategory = defineMongooseModel({
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
