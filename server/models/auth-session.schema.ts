import { defineMongooseModel } from "#nuxt/mongoose";
import mongoose from "mongoose";

export interface AuthSessionDocument {
  _id: mongoose.Types.ObjectId;
  tokenHash: string;
  userId: mongoose.Types.ObjectId;
  expiresAt: Date;
  lastSeenAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export const AuthSession = defineMongooseModel<AuthSessionDocument>({
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
