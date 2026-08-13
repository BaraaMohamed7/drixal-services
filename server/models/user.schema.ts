import { defineMongooseModel } from "#nuxt/mongoose";

export const userStatusValues = ["ACTIVE", "INACTIVE"] as const;
export const userPlatformRoleValues = ["USER", "SUPER_ADMIN"] as const;
export type UserPlatformRole = (typeof userPlatformRoleValues)[number];

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
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    status: {
      type: String,
      enum: userStatusValues,
      default: "ACTIVE",
    },
    platformRole: {
      type: String,
      enum: userPlatformRoleValues,
      default: "USER",
    },
  },
  options: {
    collection: "users",
    timestamps: true,
  },
});
