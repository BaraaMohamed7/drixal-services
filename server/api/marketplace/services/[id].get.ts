import { isValidObjectId } from "../../../utils/mongodb";
import { mapMarketplaceService } from "../../../utils/marketplace";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const serviceFilter = isValidObjectId(id)
    ? { _id: id, publicationStatus: "PUBLISHED", operationalStatus: "ACTIVE" }
    : { slug: id, publicationStatus: "PUBLISHED", operationalStatus: "ACTIVE" };
  const service = await Service.findOne(serviceFilter).populate("companyId").populate("categoryId");
  const company = service?.companyId;
  const companyStatus = typeof company === "object" && company !== null && "status" in company ? company.status : undefined;

  if (!service || companyStatus !== "APPROVED") {
    throw createError({ statusCode: 404, statusMessage: "Service not found" });
  }

  return mapMarketplaceService(service);
});
