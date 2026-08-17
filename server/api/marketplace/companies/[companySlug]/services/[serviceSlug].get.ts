import { mapMarketplaceService } from "../../../../../utils/marketplace";

export default defineEventHandler(async (event) => {
  const companySlug = getRouterParam(event, "companySlug");
  const serviceSlug = getRouterParam(event, "serviceSlug");
  const company = await Company.findOne({ slug: companySlug, status: "ACTIVE" }).select("_id");

  if (!company) throw createError({ statusCode: 404, statusMessage: "Service not found" });

  const service = await Service.findOne({
    companyId: company._id,
    slug: serviceSlug,
    publicationStatus: "PUBLISHED",
    operationalStatus: "ACTIVE",
  })
    .populate("companyId")
    .populate("categoryId");

  if (!service) throw createError({ statusCode: 404, statusMessage: "Service not found" });

  return mapMarketplaceService(service);
});