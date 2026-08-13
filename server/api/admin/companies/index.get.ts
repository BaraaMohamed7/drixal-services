import { requirePermission } from "../../../utils/session";

export default defineEventHandler(async (event) => {
  await requirePermission(event, "companies.review");
  const query = getQuery(event);
  const filter: Record<string, unknown> = {};

  if (typeof query.status === "string" && query.status) filter.status = query.status;
  if (typeof query.search === "string" && query.search.trim()) {
    const search = query.search.trim();
    filter.$or = [{ name: new RegExp(search, "i") }, { slug: new RegExp(search, "i") }, { "location.city": new RegExp(search, "i") }];
  }

  const items = await Company.find(filter).sort({ createdAt: -1 }).limit(100);
  return { items };
});
