import { getObjectIdOrThrow } from "../../../utils/mongodb";
import { getDemoCompany } from "../../../utils/services";

export default defineEventHandler(async (event) => {
  const id = getObjectIdOrThrow(getRouterParam(event, "id"));
  const company = await getDemoCompany();
  const service = await Service.findOne({ _id: id, companyId: company._id }).populate("companyId").populate("categoryId");

  if (!service) {
    throw createError({ statusCode: 404, statusMessage: "Service not found" });
  }

  return service;
});
