import { CompanyApplication } from "../../../models/company-application.schema";
import { Company } from "../../../models/company.schema";
import { requireUser } from "../../../utils/auth";
import { requirePlatformTenant } from "../../../utils/tenant-guard";
import { writeAuditLog } from "../../../utils/audit";
import { getObjectIdOrThrow } from "../../../utils/mongodb";

export default defineEventHandler(async (event) => {
  requirePlatformTenant(event);
  const session = await requireUser(event);
  if (!session.isSuperAdmin) {
    throw createError({ statusCode: 403, statusMessage: "Only platform administrators can review applications" });
  }

  const id = getObjectIdOrThrow(getRouterParam(event, "id"));
  const body = await readBody<{ decision?: unknown; rejectionReason?: unknown }>(event);
  const decision = typeof body?.decision === "string" ? body.decision.toUpperCase() : "";
  const rejectionReason = typeof body?.rejectionReason === "string" ? body.rejectionReason.trim() : "";

  if (decision !== "APPROVED" && decision !== "REJECTED") {
    throw createError({ statusCode: 400, statusMessage: "Decision must be APPROVED or REJECTED" });
  }

  const application = await CompanyApplication.findById(id);
  if (!application) throw createError({ statusCode: 404, statusMessage: "Application not found" });
  if (application.status !== "PENDING") {
    throw createError({ statusCode: 409, statusMessage: "Application has already been reviewed" });
  }

  if (decision === "REJECTED" && !rejectionReason) {
    throw createError({ statusCode: 400, statusMessage: "Rejection reason is required" });
  }

  const existingCompany = await Company.findOne({ slug: application.companySlug }).select("_id");
  if (decision === "APPROVED" && existingCompany) {
    throw createError({ statusCode: 409, statusMessage: "Company slug is already registered" });
  }

  application.status = decision;
  application.reviewedBy = session.user._id;
  application.reviewedAt = new Date();
  if (decision === "REJECTED") application.rejectionReason = rejectionReason;
  await application.save();

  if (decision === "APPROVED") {
    const company = await Company.create({
      name: application.companyName,
      slug: application.companySlug,
      description: application.description,
      location: application.location,
      status: "PENDING",
    });

    await writeAuditLog(event, {
      targetType: "COMPANY",
      targetId: company._id,
      action: "APPROVE",
      summary: `Company "${company.name}" created from approved application`,
      metadata: { applicationId: String(application._id) },
    });
  }

  await writeAuditLog(event, {
    targetType: "COMPANY",
    targetId: application._id,
    action: decision === "APPROVED" ? "APPROVE" : "REJECT",
    summary: `Application "${application.companyName}" ${decision.toLowerCase()}`,
    metadata: { decision, rejectionReason: rejectionReason || undefined },
  });

  return {
    application: {
      id: application._id,
      companyName: application.companyName,
      status: application.status,
      reviewedAt: application.reviewedAt,
    },
  };
});
