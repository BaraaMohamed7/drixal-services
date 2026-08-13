import type { H3Event } from "h3";
import { getAuthContext, requireUser } from "./auth";
import type { Permission } from "./permissions";

export const getCurrentSession = (event: H3Event) => getAuthContext(event);

export const requirePermission = async (event: H3Event, permission: Permission) => {
  const session = await requireUser(event);
  if (!session.permissions.includes(permission)) {
    throw createError({ statusCode: 403, statusMessage: `Permission required: ${permission}` });
  }
  return session;
};

export const getCurrentCompany = async (event: H3Event, permission: Permission) => {
  const session = await requirePermission(event, permission);
  if (!session.company) throw createError({ statusCode: 403, statusMessage: "Active company membership required" });
  const restrictedMutation = ["requests.decide", "requests.convert", "customers.manage", "orders.manage"].includes(permission);
  if (restrictedMutation && session.company.status !== "APPROVED") {
    throw createError({ statusCode: 403, statusMessage: "Company must be approved for operational changes" });
  }
  if (permission === "services.manage" && ["REJECTED", "SUSPENDED"].includes(session.company.status)) {
    throw createError({ statusCode: 403, statusMessage: "Company cannot modify services in its current status" });
  }
  return session.company;
};
