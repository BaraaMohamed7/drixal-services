import { defineMongooseModel } from "#nuxt/mongoose";
import mongoose from "mongoose";

export const AuthSession = defineMongooseModel({
  name: "AuthSession",
  schema: {
    tokenHash: {
      type: String,
      required: true,
      unique: true,
      select: false,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    lastSeenAt: {
      type: Date,
      required: true,
    },
  },
  options: {
    collection: "auth_sessions",
    timestamps: true,
  },
  hooks(schema) {
    schema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
    schema.index({ userId: 1, expiresAt: -1 });
  },
});
