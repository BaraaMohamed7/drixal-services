import { isValidObjectId } from "../../utils/mongodb";
import { mapMarketplaceService } from "../../utils/marketplace";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || 20, 1), 100);
  const companyFilter: Record<string, unknown> = { status: "ACTIVE" };
  const serviceFilter: Record<string, unknown> = {
    publicationStatus: "PUBLISHED",
    operationalStatus: "ACTIVE",
  };

  if (typeof query.city === "string" && query.city.trim()) companyFilter["location.city"] = query.city.trim();
  if (typeof query.category === "string" && query.category.trim()) {
    const category = await ServiceCategory.findOne({ slug: query.category.trim(), isActive: true });

    if (!category && isValidObjectId(query.category)) {
      serviceFilter.categoryId = query.category;
    } else if (category) {
      serviceFilter.categoryId = category._id;
    } else {
      return {
        items: [],
        pagination: { page, limit, total: 0, pages: 0 },
      };
    }
  }
  if (typeof query.search === "string" && query.search.trim()) {
    serviceFilter.$text = { $search: query.search.trim() };
  }
  if (query.minPrice !== undefined || query.maxPrice !== undefined) {
    const priceFilter: Record<string, number> = {};
    const minPrice = Number(query.minPrice);
    const maxPrice = Number(query.maxPrice);

    if (Number.isFinite(minPrice)) priceFilter.$gte = minPrice;
    if (Number.isFinite(maxPrice)) priceFilter.$lte = maxPrice;
    if (Object.keys(priceFilter).length) serviceFilter["pricing.amount"] = priceFilter;
  }

  const approvedCompanies = await Company.find(companyFilter).select("_id");
  const companyIds = approvedCompanies.map((company) => company._id);
  serviceFilter.companyId = { $in: companyIds };

  const [items, total] = await Promise.all([
    Service.find(serviceFilter)
      .populate("companyId")
      .populate("categoryId")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Service.countDocuments(serviceFilter),
  ]);

  return {
    items: items.map(mapMarketplaceService),
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
});
