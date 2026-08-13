import { defineMongooseModel } from "#nuxt/mongoose";

export const userStatusValues = ["ACTIVE", "INACTIVE"] as const;

export const User = defineMongooseModel({
  name: "User",
  schema: {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    status: {
      type: String,
      enum: userStatusValues,
      default: "ACTIVE",
    },
  },
  options: {
    collection: "users",
    timestamps: true,
  },
});
