import { defineMongooseModel } from "#nuxt/mongoose";
import mongoose from "mongoose";

export const companyInvitationStatusValues = ["PENDING", "ACCEPTED", "EXPIRED", "REVOKED"] as const;
export type CompanyInvitationStatus = (typeof companyInvitationStatusValues)[number];

export interface CompanyInvitationDocument {
  _id: mongoose.Types.ObjectId;
  companyId: mongoose.Types.ObjectId;
  email: string;
  invitedByUserId: mongoose.Types.ObjectId;
  tokenHash: string;
  status: CompanyInvitationStatus;
  acceptedByUserId?: mongoose.Types.ObjectId;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export const CompanyInvitation = defineMongooseModel<CompanyInvitationDocument>({
  name: "CompanyInvitation",
  schema: {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    invitedByUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tokenHash: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: companyInvitationStatusValues,
      default: "PENDING",
    },
    acceptedByUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  options: {
    collection: "company_invitations",
    timestamps: true,
  },
  hooks(schema) {
    schema.index({ companyId: 1, email: 1 });
    schema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
    schema.index({ tokenHash: 1 });
  },
});
