import { getDemoCompany } from "../../utils/services";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const company = await getDemoCompany();
  const filter: Record<string, unknown> = { companyId: company._id };

  if (typeof query.status === "string" && query.status) filter.status = query.status;

  const items = await ServiceRequest.find(filter).populate("serviceId").sort({ createdAt: -1 }).limit(100);

  return { items };
});
