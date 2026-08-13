import type { CompanyMembershipRole } from "../models/company-membership.schema";
import type { UserPlatformRole } from "../models/user.schema";

const companyPermissionValues = [
  "company.read",
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

export const permissionValues = [...companyPermissionValues, "companies.review"] as const;

export type Permission = (typeof permissionValues)[number];

const allCompanyPermissions = [...companyPermissionValues];

export const rolePermissions: Record<CompanyMembershipRole, Permission[]> = {
  OWNER: allCompanyPermissions,
  ADMIN: allCompanyPermissions,
  MANAGER: allCompanyPermissions,
  TECHNICIAN: ["company.read", "orders.read"],
  VIEWER: ["company.read", "services.read", "requests.read", "customers.read", "orders.read"],
};

export const platformRolePermissions: Record<UserPlatformRole, Permission[]> = {
  USER: [],
  SUPER_ADMIN: ["companies.review"],
};

export const getPermissionsForRole = (role: unknown): Permission[] => {
  if (typeof role !== "string" || !(role in rolePermissions)) return [];
  return rolePermissions[role as CompanyMembershipRole];
};

export const getPermissionsForPlatformRole = (role: unknown): Permission[] => {
  if (typeof role !== "string" || !(role in platformRolePermissions)) return [];
  return platformRolePermissions[role as UserPlatformRole];
};
