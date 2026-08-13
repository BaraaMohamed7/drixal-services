import type { CompanyMembershipRole } from "../models/company-membership.schema";

export const permissionValues = [
  "services.read",
  "services.manage",
  "services.publish",
  "requests.read",
  "requests.decide",
  "requests.convert",
  "customers.read",
  "customers.manage",
  "orders.read",
  "orders.manage",
] as const;

export type Permission = (typeof permissionValues)[number];

const allPermissions = [...permissionValues];

export const rolePermissions: Record<CompanyMembershipRole, Permission[]> = {
  OWNER: allPermissions,
  ADMIN: allPermissions,
  MANAGER: allPermissions,
  TECHNICIAN: ["orders.read"],
  VIEWER: ["services.read", "requests.read", "customers.read", "orders.read"],
};

export const getPermissionsForRole = (role: unknown): Permission[] => {
  if (typeof role !== "string" || !(role in rolePermissions)) return [];
  return rolePermissions[role as CompanyMembershipRole];
};
