import { getDemoCompany } from "../../utils/services";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const company = await getDemoCompany();
  const filter: Record<string, unknown> = { companyId: company._id };

  if (typeof query.status === "string" && query.status) filter.status = query.status;
  if (typeof query.search === "string" && query.search.trim()) {
    const search = query.search.trim();
    filter.$or = [{ name: new RegExp(search, "i") }, { phone: new RegExp(search, "i") }, { email: new RegExp(search, "i") }];
  }

  const items = await Customer.find(filter).sort({ createdAt: -1 }).limit(100);

  return { items };
});
