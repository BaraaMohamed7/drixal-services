import { CompanyApplication } from "../../../models/company-application.schema";
import { requirePermission } from "../../../utils/session";
import { requirePlatformTenant } from "../../../utils/tenant-guard";
import { escapeRegExp } from "../../../utils/mongodb";

export default defineEventHandler(async (event) => {
  requirePlatformTenant(event);
  await requirePermission(event, "companies.review");
  const query = getQuery(event);
  const filter: Record<string, unknown> = {};

  if (typeof query.status === "string" && query.status) filter.status = query.status;
  if (typeof query.search === "string" && query.search.trim()) {
    const search = query.search.trim();
    filter.$or = [
      { companyName: new RegExp(escapeRegExp(search), "i") },
      { companySlug: new RegExp(escapeRegExp(search), "i") },
    ];
  }

  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || 20, 1), 100);

  const [items, total] = await Promise.all([
    CompanyApplication.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).populate("applicantUserId", "name email"),
    CompanyApplication.countDocuments(filter),
  ]);

  return {
    items,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
});
