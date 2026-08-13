import { CompanyMembership } from "../models/company-membership.schema";
import { User } from "../models/user.schema";
import { getPermissionsForPlatformRole, getPermissionsForRole, type Permission } from "./permissions";
import { getDemoCompany } from "./services";

export const demoUserEmail = process.env.DEMO_USER_EMAIL || "manager@coolair.example";

export const getCurrentSession = async () => {
  const user = await User.findOne({ email: demoUserEmail, status: "ACTIVE" });
  const demoCompany = await getDemoCompany();
  let membership = user
    ? await CompanyMembership.findOne({ userId: user._id, companyId: demoCompany._id, status: "ACTIVE" }).populate("companyId").populate("userId")
    : null;

  if (user && !membership) {
    membership = await CompanyMembership.findOne({ userId: user._id, status: "ACTIVE" }).populate("companyId").populate("userId");
  }

  const membershipCompany = membership?.companyId;
  const company = membershipCompany && typeof membershipCompany === "object" && "_id" in membershipCompany ? membershipCompany : null;
  const permissions = [...new Set([...getPermissionsForRole(membership?.role), ...getPermissionsForPlatformRole(user?.platformRole)])];

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
  if (!session.permissions.includes(permission)) {
    throw createError({ statusCode: 403, statusMessage: `Permission required: ${permission}` });
  }

  return session;
};

export const getCurrentCompany = async (permission: Permission) => {
  const session = await requirePermission(permission);

  if (!session.company) throw createError({ statusCode: 403, statusMessage: "Active company membership required" });

  return session.company;
};
