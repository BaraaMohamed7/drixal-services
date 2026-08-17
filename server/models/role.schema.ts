import { defineMongooseModel } from "#nuxt/mongoose";
import mongoose from "mongoose";
import { permissionValues } from "../utils/permissions";

export const roleKindValues = ["SYSTEM", "CUSTOM"] as const;
export type RoleKind = (typeof roleKindValues)[number];

export interface RoleDocument {
  _id: mongoose.Types.ObjectId;
  companyId: mongoose.Types.ObjectId;
  name: string;
  normalizedName: string;
  description: string;
  permissions: string[];
  kind: RoleKind;
  systemKey?: string;
  createdBy: mongoose.Types.ObjectId;
  updatedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export const Role = defineMongooseModel<RoleDocument>({
  name: "Role",
  schema: {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    normalizedName: {
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
    permissions: {
      type: [String],
      default: [],
      validate: {
        validator(permissions: string[]) {
          return permissions.every((p) => (permissionValues as readonly string[]).includes(p));
        },
        message: "Invalid permission value: {VALUE}",
      },
    },
    kind: {
      type: String,
      enum: roleKindValues,
      default: "CUSTOM",
    },
    systemKey: {
      type: String,
      sparse: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  options: {
    collection: "roles",
    timestamps: true,
  },
  hooks(schema) {
    schema.index({ companyId: 1, normalizedName: 1 }, { unique: true });
    schema.index({ companyId: 1, systemKey: 1 }, { unique: true, sparse: true });
    schema.index({ companyId: 1 });
  },
});
