import { getDemoCompany } from "../../utils/services";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || 20, 1), 100);
  const company = await getDemoCompany();
  const filter: Record<string, unknown> = { companyId: company._id };

  if (typeof query.publicationStatus === "string") filter.publicationStatus = query.publicationStatus;
  if (typeof query.operationalStatus === "string") filter.operationalStatus = query.operationalStatus;
  if (typeof query.categoryId === "string") filter.categoryId = query.categoryId;
  if (typeof query.search === "string" && query.search.trim()) {
    filter.$text = { $search: query.search.trim() };
  }

  const [items, total] = await Promise.all([
    Service.find(filter)
      .populate("companyId")
      .populate("categoryId")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Service.countDocuments(filter),
  ]);

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
});
