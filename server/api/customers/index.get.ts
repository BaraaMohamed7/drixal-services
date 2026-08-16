import { getProviderCompany } from "../../utils/services";
import { escapeRegExp } from "../../utils/mongodb";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const company = await getProviderCompany(event, "customers.read");
  const filter: Record<string, unknown> = { companyId: company._id };

  if (typeof query.status === "string" && query.status) filter.status = query.status;
  if (typeof query.search === "string" && query.search.trim()) {
    const search = query.search.trim();
    filter.$or = [{ name: new RegExp(escapeRegExp(search), "i") }, { phone: new RegExp(escapeRegExp(search), "i") }, { email: new RegExp(escapeRegExp(search), "i") }];
  }

  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || 20, 1), 100);

  const [items, total] = await Promise.all([
    Customer.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    Customer.countDocuments(filter),
  ]);

  return {
    items,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
});
