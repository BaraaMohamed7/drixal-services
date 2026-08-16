import { getProviderCompany } from "../../utils/services";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const company = await getProviderCompany(event, "requests.read");
  const filter: Record<string, unknown> = { companyId: company._id };

  if (typeof query.status === "string" && query.status) filter.status = query.status;

  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || 20, 1), 100);

  const [items, total] = await Promise.all([
    ServiceRequest.find(filter)
      .populate("serviceId")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    ServiceRequest.countDocuments(filter),
  ]);

  return {
    items,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
});
