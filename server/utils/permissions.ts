import type { CompanyMembershipRole } from "../models/company-membership.schema";
import type { UserPlatformRole } from "../models/user.schema";

export const companyPermissionValues = [
  "members.read",
  "members.create",
  "members.update",
  "members.deactivate",
  "members.assign_role",
  "roles.read",
  "roles.create",
  "roles.update",
  "roles.delete",
  "roles.manage_permissions",
  "services.read",
  "services.create",
  "services.update",
  "services.delete",
  "services.publish",
  "requests.read",
  "requests.assign",
  "requests.update_status",
  "requests.convert",
  "customers.read",
  "customers.create",
  "customers.update",
  "orders.read",
  "orders.create",
  "orders.update",
  "orders.manage",
  "company_settings.read",
  "company_settings.update",
  "domains.read",
  "domains.create",
  "domains.update",
  "domains.delete",
] as const;

export const permissionValues = [...companyPermissionValues, "companies.review"] as const;

export type Permission = (typeof permissionValues)[number];

export const allCompanyPermissions: Permission[] = [...companyPermissionValues];

/** @deprecated Use dynamic Role permissions instead. Kept for backward compatibility during migration. */
const legacyRolePermissions: Record<CompanyMembershipRole, Permission[]> = {
  OWNER: allCompanyPermissions,
  ADMIN: allCompanyPermissions,
  MANAGER: allCompanyPermissions,
  TECHNICIAN: ["members.read", "services.read", "orders.read"],
  VIEWER: ["members.read", "services.read", "requests.read", "customers.read", "orders.read"],
};

export const platformRolePermissions: Record<UserPlatformRole, Permission[]> = {
  USER: [],
  SUPER_ADMIN: ["companies.review"],
};

/** @deprecated Use dynamic Role permissions instead. */
export const getPermissionsForRole = (role: unknown): Permission[] => {
  if (typeof role !== "string" || !(role in legacyRolePermissions)) return [];
  return legacyRolePermissions[role as CompanyMembershipRole];
};

export const getPermissionsForPlatformRole = (role: unknown): Permission[] => {
  if (typeof role !== "string" || !(role in platformRolePermissions)) return [];
  return platformRolePermissions[role as UserPlatformRole];
};

export const isValidPermission = (value: string): value is Permission =>
  (permissionValues as readonly string[]).includes(value);
