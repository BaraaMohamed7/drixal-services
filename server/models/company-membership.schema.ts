import { defineMongooseModel } from "#nuxt/mongoose";
import mongoose from "mongoose";

export const companyMembershipRoleValues = ["OWNER", "ADMIN", "MANAGER", "TECHNICIAN", "VIEWER"] as const;
export const companyMembershipStatusValues = ["ACTIVE", "INACTIVE"] as const;
export type CompanyMembershipRole = (typeof companyMembershipRoleValues)[number];
export type CompanyMembershipStatus = (typeof companyMembershipStatusValues)[number];

export interface CompanyMembershipDocument {
  _id: mongoose.Types.ObjectId;
  companyId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  roleId?: mongoose.Types.ObjectId;
  /** @deprecated Use roleId instead. Will be removed after migration. */
  role: CompanyMembershipRole;
  status: CompanyMembershipStatus;
  createdAt: Date;
  updatedAt: Date;
}

export const CompanyMembership = defineMongooseModel<CompanyMembershipDocument>({
  name: "CompanyMembership",
  schema: {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    roleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
    },
    /** @deprecated Use roleId instead. Will be removed after migration. */
    role: {
      type: String,
      enum: companyMembershipRoleValues,
      default: "MANAGER",
    },
    status: {
      type: String,
      enum: companyMembershipStatusValues,
      default: "ACTIVE",
    },
  },
  options: {
    collection: "company_memberships",
    timestamps: true,
  },
  hooks(schema) {
    schema.index({ companyId: 1, userId: 1 }, { unique: true });
    schema.index({ userId: 1, status: 1 });
    schema.index({ userId: 1 }, { unique: true, partialFilterExpression: { status: "ACTIVE" } });
  },
});
