import { requirePermission } from "../../../utils/session";
import { escapeRegExp } from "../../../utils/mongodb";

export default defineEventHandler(async (event) => {
  await requirePermission(event, "companies.review");
  const query = getQuery(event);
  const filter: Record<string, unknown> = {};

  if (typeof query.status === "string" && query.status) filter.status = query.status;
  if (typeof query.search === "string" && query.search.trim()) {
    const search = query.search.trim();
    filter.$or = [{ name: new RegExp(escapeRegExp(search), "i") }, { slug: new RegExp(escapeRegExp(search), "i") }, { "location.city": new RegExp(escapeRegExp(search), "i") }];
  }

  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || 20, 1), 100);

  const [items, total] = await Promise.all([
    Company.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    Company.countDocuments(filter),
  ]);

  return {
    items,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
});
