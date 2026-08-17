import { CompanyDomain } from "../../models/company-domain.schema";
import { getCurrentCompany } from "../../utils/session";

export default defineEventHandler(async (event) => {
  const company = await getCurrentCompany(event, "domains.read");
  const domains = await CompanyDomain.find({ companyId: company._id }).sort({ isPrimary: -1, createdAt: -1 });

  return {
    items: domains.map((d) => ({
      id: d._id,
      hostname: d.hostname,
      type: d.type,
      status: d.status,
      isPrimary: d.isPrimary,
      verifiedAt: d.verifiedAt,
      createdAt: d.createdAt,
    })),
  };
});
