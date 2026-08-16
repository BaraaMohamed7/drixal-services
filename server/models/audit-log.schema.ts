import { defineMongooseModel } from "#nuxt/mongoose";
import mongoose from "mongoose";

export const auditLogTargetValues = ["SERVICE_REQUEST", "SERVICE_ORDER", "SERVICE", "COMPANY", "CUSTOMER", "USER"] as const;
export const auditLogActionValues = [
  "CREATE",
  "UPDATE",
  "APPROVE",
  "REJECT",
  "CONVERT",
  "PUBLISH",
  "UNPUBLISH",
  "ASSIGN",
  "SUSPEND",
  "STATUS_CHANGE",
] as const;

export type AuditLogTarget = (typeof auditLogTargetValues)[number];
export type AuditLogAction = (typeof auditLogActionValues)[number];

export interface AuditLogDocument {
  _id: mongoose.Types.ObjectId;
  actorUserId?: mongoose.Types.ObjectId;
  actorName?: string;
  actorRole?: string;
  companyId?: mongoose.Types.ObjectId;
  targetType: AuditLogTarget;
  targetId: mongoose.Types.ObjectId;
  action: AuditLogAction;
  summary: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export const AuditLog = defineMongooseModel<AuditLogDocument>({
  name: "AuditLog",
  schema: {
    actorUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    actorName: { type: String, required: false },
    actorRole: { type: String, required: false },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: false,
    },
    targetType: { type: String, enum: auditLogTargetValues, required: true },
    targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
    action: { type: String, enum: auditLogActionValues, required: true },
    summary: { type: String, required: true },
    metadata: { type: mongoose.Schema.Types.Mixed, required: false },
  },
  options: {
    collection: "audit_logs",
    timestamps: true,
  },
  hooks(schema) {
    schema.index({ targetType: 1, targetId: 1 });
    schema.index({ companyId: 1, createdAt: -1 });
    schema.index({ actorUserId: 1, createdAt: -1 });
  },
});