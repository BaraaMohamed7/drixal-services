import { getObjectIdOrThrow } from "../../../utils/mongodb";
import { getDemoCompany } from "../../../utils/services";

export default defineEventHandler(async (event) => {
  const id = getObjectIdOrThrow(getRouterParam(event, "id"));
  const company = await getDemoCompany();
  const body = await readBody<{ action?: string }>(event);

  if (body?.action !== "publish" && body?.action !== "unpublish") {
    throw createError({ statusCode: 400, statusMessage: "action must be publish or unpublish" });
  }

  if (body.action === "publish" && company.status !== "APPROVED") {
    throw createError({ statusCode: 400, statusMessage: "Company must be APPROVED before publishing services" });
  }

  const publicationStatus = body.action === "publish" ? "PUBLISHED" : "UNPUBLISHED";
  const service = await Service.findOneAndUpdate(
    { _id: id, companyId: company._id },
    { publicationStatus },
    { returnDocument: "after", runValidators: true },
  )
    .populate("companyId")
    .populate("categoryId");

  if (!service) {
    throw createError({ statusCode: 404, statusMessage: "Service not found" });
  }

  return service;
});
