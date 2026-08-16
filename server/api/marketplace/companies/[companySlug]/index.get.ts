import { mapMarketplaceService } from "../../../../utils/marketplace";

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, "companySlug");
  const company = await Company.findOne({ slug, status: "APPROVED" });
  if (!company) throw createError({ statusCode: 404, statusMessage: "Company not found" });

  const services = await Service.find({
    companyId: company._id,
    publicationStatus: "PUBLISHED",
    operationalStatus: "ACTIVE",
  })
    .populate("companyId")
    .populate("categoryId")
    .sort({ createdAt: -1 });

  return {
    company: {
      id: String(company._id),
      name: company.name,
      slug: company.slug,
      description: company.description,
      rating: company.rating,
      location: company.location,
    },
    services: services.map(mapMarketplaceService),
  };
});