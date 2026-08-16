import type { H3Event } from "h3";
import type { Types } from "mongoose";
import { AuditLog, type AuditLogAction, type AuditLogTarget } from "../models/audit-log.schema";
import { getAuthContext } from "./auth";

type AuditEntry = {
  targetType: AuditLogTarget;
  targetId: Types.ObjectId | string;
  action: AuditLogAction;
  summary: string;
  metadata?: Record<string, unknown>;
  companyId?: Types.ObjectId | string;
};

export const writeAuditLog = async (event: H3Event, entry: AuditEntry) => {
  try {
    const session = await getAuthContext(event);
    await AuditLog.create({
      actorUserId: session?.user?._id,
      actorName: session?.user?.name,
      actorRole: session?.membership?.role || session?.user?.platformRole,
      companyId: entry.companyId || session?.company?._id,
      targetType: entry.targetType,
      targetId: entry.targetId,
      action: entry.action,
      summary: entry.summary,
      metadata: entry.metadata,
    });
  } catch (error) {
    console.error("Failed to write audit log:", error);
  }
};