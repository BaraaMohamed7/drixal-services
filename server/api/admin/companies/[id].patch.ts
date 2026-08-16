import { assertCompanyStatusTransition, normalizeCompanyReviewStatus } from "../../../utils/companies";
import { writeAuditLog } from "../../../utils/audit";
import { getObjectIdOrThrow } from "../../../utils/mongodb";
import { requirePermission } from "../../../utils/session";

export default defineEventHandler(async (event) => {
  await requirePermission(event, "companies.review");
  const id = getObjectIdOrThrow(getRouterParam(event, "id"));
  const body = await readBody<{ status?: unknown }>(event);
  const status = normalizeCompanyReviewStatus(body?.status);
  const current = await Company.findById(id).select("status");

  if (!current) throw createError({ statusCode: 404, statusMessage: "Company not found" });
  assertCompanyStatusTransition(current.status, status);

  const company = await Company.findByIdAndUpdate(id, { status }, { returnDocument: "after", runValidators: true });
  await writeAuditLog(event, {
    targetType: "COMPANY",
    targetId: company?._id || id,
    action: status === "APPROVED" ? "APPROVE" : status === "REJECTED" ? "REJECT" : "SUSPEND",
    summary: `Company "${company?.name || id}" changed from ${current.status} to ${status}`,
    metadata: { from: current.status, to: status },
  });
  return company;
});