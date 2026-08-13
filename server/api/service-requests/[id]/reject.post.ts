import { getObjectIdOrThrow } from "../../../utils/mongodb";
import { getDemoCompany } from "../../../utils/services";

export default defineEventHandler(async (event) => {
  const id = getObjectIdOrThrow(getRouterParam(event, "id"));
  const company = await getDemoCompany();
  const request = await ServiceRequest.findOneAndUpdate(
    { _id: id, companyId: company._id, status: { $ne: "CONVERTED" } },
    { status: "REJECTED" },
    { returnDocument: "after", runValidators: true },
  ).populate("serviceId");

  if (!request) throw createError({ statusCode: 404, statusMessage: "Service request not found" });

  return request;
});
