import { CompanyMembership } from "../models/company-membership.schema";
import { User } from "../models/user.schema";
import { getPermissionsForRole, type Permission } from "./permissions";
import { demoCompanySlug, getDemoCompany } from "./services";

export const demoUserEmail = process.env.DEMO_USER_EMAIL || "manager@coolair.example";

export const getCurrentSession = async () => {
  const user = await User.findOne({ email: demoUserEmail, status: "ACTIVE" });
  const company = await getDemoCompany();
  const membership = user
    ? await CompanyMembership.findOne({ userId: user._id, companyId: company._id, status: "ACTIVE" }).populate("companyId").populate("userId")
    : null;
  const permissions = getPermissionsForRole(membership?.role);

  return {
    user,
    company,
    membership,
    permissions,
    demo: true,
  };
};

export const requirePermission = async (permission: Permission) => {
  const session = await getCurrentSession();

  if (!session.user) throw createError({ statusCode: 401, statusMessage: "Authentication required" });
  if (!session.membership) throw createError({ statusCode: 403, statusMessage: "Active company membership required" });
  if (!session.permissions.includes(permission)) {
    throw createError({ statusCode: 403, statusMessage: `Permission required: ${permission}` });
  }

  return session;
};

export const getCurrentCompany = async (permission: Permission) => {
  const session = await requirePermission(permission);

  return session.company;
};
