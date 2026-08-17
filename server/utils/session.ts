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
  const restrictedMutation = ["requests.update_status", "requests.convert", "customers.create", "customers.update", "orders.manage", "services.create", "services.update"].includes(permission);
  if (restrictedMutation && session.company.status !== "ACTIVE") {
    throw createError({ statusCode: 403, statusMessage: "Company must be active for operational changes" });
  }
  if (["services.create", "services.update"].includes(permission) && ["SUSPENDED"].includes(session.company.status)) {
    throw createError({ statusCode: 403, statusMessage: "Company cannot modify services in its current status" });
  }
  return session.company;
};
