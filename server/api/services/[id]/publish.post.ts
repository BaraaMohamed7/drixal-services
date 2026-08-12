import { getObjectIdOrThrow } from "../../../utils/mongodb";
import { getDemoCompany } from "../../../utils/services";

export default defineEventHandler(async (event) => {
  const id = getObjectIdOrThrow(getRouterParam(event, "id"));
  const company = await getDemoCompany();

  if (company.status !== "APPROVED") {
    throw createError({ statusCode: 400, statusMessage: "Company must be APPROVED before publishing services" });
  }

  const service = await Service.findOneAndUpdate(
    { _id: id, companyId: company._id },
    { publicationStatus: "PUBLISHED" },
    { returnDocument: "after", runValidators: true },
  )
    .populate("companyId")
    .populate("categoryId");

  if (!service) {
    throw createError({ statusCode: 404, statusMessage: "Service not found" });
  }

  return service;
});
