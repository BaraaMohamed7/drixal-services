import { createHash } from "node:crypto";
import { Company } from "../../models/company.schema";
import { CompanyMembership } from "../../models/company-membership.schema";
import { CompanyInvitation } from "../../models/company-invitation.schema";
import { Role } from "../../models/role.schema";
import { User } from "../../models/user.schema";
import { requireUser } from "../../utils/auth";
import { writeAuditLog } from "../../utils/audit";

const hashToken = (token: string) => createHash("sha256").update(token).digest("base64url");

export default defineEventHandler(async (event) => {
  const session = await requireUser(event);
  const body = await readBody<{ token?: unknown }>(event);
  const token = typeof body?.token === "string" ? body.token : "";

  if (!token) throw createError({ statusCode: 400, statusMessage: "Invitation token is required" });

  const invitation = await CompanyInvitation.findOne({ tokenHash: hashToken(token), status: "PENDING" });
  if (!invitation) throw createError({ statusCode: 404, statusMessage: "Invalid or expired invitation" });
  if (invitation.expiresAt < new Date()) {
    invitation.status = "EXPIRED";
    await invitation.save();
    throw createError({ statusCode: 410, statusMessage: "Invitation has expired" });
  }

  const company = await Company.findById(invitation.companyId);
  if (!company) throw createError({ statusCode: 404, statusMessage: "Company not found" });
  if (company.ownerUserId) {
    throw createError({ statusCode: 409, statusMessage: "Company already has an owner assigned" });
  }

  const user = await User.findById(session.user._id);
  if (!user) throw createError({ statusCode: 404, statusMessage: "User not found" });
  if (user.email !== invitation.email) {
    throw createError({ statusCode: 403, statusMessage: "This invitation was sent to a different email address" });
  }

  const adminRole = await Role.findOne({ companyId: company._id, systemKey: "admin" });
  if (!adminRole) {
    throw createError({ statusCode: 500, statusMessage: "Admin role not found for company" });
  }

  user.type = "COMPANY_USER";
  await user.save();

  await CompanyMembership.create({
    companyId: company._id,
    userId: user._id,
    roleId: adminRole._id,
    role: "OWNER",
    status: "ACTIVE",
  });

  await Company.findByIdAndUpdate(company._id, { ownerUserId: user._id, status: "ACTIVE" });

  invitation.status = "ACCEPTED";
  invitation.acceptedByUserId = user._id;
  await invitation.save();

  await writeAuditLog(event, {
    targetType: "COMPANY",
    targetId: company._id,
    action: "UPDATE",
    summary: `Owner invitation accepted by "${user.email}" for "${company.name}"`,
  });

  return { success: true };
});
