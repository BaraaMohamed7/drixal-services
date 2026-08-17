export type StatusColor = "primary" | "success" | "info" | "warning" | "error" | "neutral";

export const statusColor = (status: string): StatusColor => ({
  ACTIVE: "success",
  APPROVED: "success",
  COMPLETED: "success",
  CONVERTED: "success",
  PUBLISHED: "success",
  ASSIGNED: "primary",
  IN_PROGRESS: "info",
  NEW: "info",
  SCHEDULED: "info",
  CONTACTED: "warning",
  DRAFT: "warning",
  ON_HOLD: "warning",
  PENDING: "warning",
  SETUP: "warning",
  UNDER_REVIEW: "warning",
  CANCELLED: "neutral",
  CLOSED: "neutral",
  INACTIVE: "neutral",
  UNPUBLISHED: "neutral",
  REJECTED: "error",
  SUSPENDED: "error",
}[status] as StatusColor || "neutral");

export const priorityColor = (priority: string): StatusColor => ({
  LOW: "neutral",
  MEDIUM: "info",
  HIGH: "warning",
  CRITICAL: "error",
}[priority] as StatusColor || "neutral");
