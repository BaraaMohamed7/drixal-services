import { createHash, randomBytes } from "node:crypto";
import { Company } from "../../models/company.schema";
import { CompanyMembership } from "../../models/company-membership.schema";
import { CompanyInvitation } from "../../models/company-invitation.schema";
import { Role } from "../../models/role.schema";
import { User } from "../../models/user.schema";
import { requireUser } from "../../utils/auth";
import { writeAuditLog } from "../../utils/audit";
import { isValidObjectId } from "../../utils/mongodb";

const invitationDuration = 7 * 24 * 60 * 60 * 1000; // 7 days
const hashToken = (token: string) => createHash("sha256").update(token).digest("base64url");

export default defineEventHandler(async (event) => {
  const session = await requireUser(event);
  const body = await readBody<{ companyId?: unknown; useCurrentAccount?: unknown; inviteEmail?: unknown }>(event);
  const companyId = typeof body?.companyId === "string" ? body.companyId : "";
  const useCurrentAccount = body?.useCurrentAccount === true;
  const inviteEmail = typeof body?.inviteEmail === "string" ? body.inviteEmail.trim().toLowerCase() : "";

  if (!isValidObjectId(companyId)) throw createError({ statusCode: 400, statusMessage: "A valid companyId is required" });
  if (!useCurrentAccount && !inviteEmail) {
    throw createError({ statusCode: 400, statusMessage: "Either useCurrentAccount or inviteEmail is required" });
  }
  if (inviteEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inviteEmail)) {
    throw createError({ statusCode: 400, statusMessage: "A valid email is required for invitation" });
  }

  const company = await Company.findById(companyId);
  if (!company) throw createError({ statusCode: 404, statusMessage: "Company not found" });
  if (company.status !== "SETUP") {
    throw createError({ statusCode: 409, statusMessage: "Company setup can only be completed for companies in SETUP status" });
  }
  if (company.ownerUserId) {
    throw createError({ statusCode: 409, statusMessage: "Company already has an owner assigned" });
  }

  const adminRole = await Role.findOne({ companyId: company._id, systemKey: "admin" });
  if (!adminRole) {
    throw createError({ statusCode: 500, statusMessage: "Admin role not found for company" });
  }

  if (useCurrentAccount) {
    const user = await User.findById(session.user._id);
    if (!user) throw createError({ statusCode: 404, statusMessage: "User not found" });

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

    await writeAuditLog(event, {
      targetType: "COMPANY",
      targetId: company._id,
      action: "UPDATE",
      summary: `Owner setup completed using current account for "${company.name}"`,
    });

    return { success: true, method: "current_account" };
  }

  const existingUser = await User.findOne({ email: inviteEmail });
  if (existingUser) {
    existingUser.type = "COMPANY_USER";
    await existingUser.save();

    await CompanyMembership.create({
      companyId: company._id,
      userId: existingUser._id,
      roleId: adminRole._id,
      role: "OWNER",
      status: "ACTIVE",
    });

    await Company.findByIdAndUpdate(company._id, { ownerUserId: existingUser._id, status: "ACTIVE" });

    await writeAuditLog(event, {
      targetType: "COMPANY",
      targetId: company._id,
      action: "UPDATE",
      summary: `Owner setup completed by assigning existing user "${inviteEmail}" for "${company.name}"`,
    });

    return { success: true, method: "existing_user" };
  }

  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + invitationDuration);

  await CompanyInvitation.create({
    companyId: company._id,
    email: inviteEmail,
    invitedByUserId: session.user._id,
    tokenHash: hashToken(token),
    status: "PENDING",
    expiresAt,
  });

  await writeAuditLog(event, {
    targetType: "COMPANY",
    targetId: company._id,
    action: "UPDATE",
    summary: `Invitation sent to "${inviteEmail}" for owner setup of "${company.name}"`,
  });

  return { success: true, method: "invitation_sent", invitationToken: token };
});
