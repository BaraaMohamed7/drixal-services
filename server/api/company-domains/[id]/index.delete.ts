import { CompanyDomain } from "../../../models/company-domain.schema";
import { getCurrentCompany } from "../../../utils/session";
import { writeAuditLog } from "../../../utils/audit";
import { getObjectIdOrThrow } from "../../../utils/mongodb";

export default defineEventHandler(async (event) => {
  const company = await getCurrentCompany(event, "domains.delete");
  const id = getObjectIdOrThrow(getRouterParam(event, "id"));
  const domain = await CompanyDomain.findOne({ _id: id, companyId: company._id });

  if (!domain) throw createError({ statusCode: 404, statusMessage: "Domain not found" });
  if (domain.isPrimary) {
    throw createError({ statusCode: 409, statusMessage: "Cannot delete the primary domain" });
  }

  await domain.deleteOne();

  await writeAuditLog(event, {
    targetType: "COMPANY",
    targetId: company._id,
    action: "DELETE",
    summary: `Domain "${domain.hostname}" removed`,
  });

  return { success: true };
});
