import { getObjectIdOrThrow } from "../../../utils/mongodb";
import { getProviderCompany } from "../../../utils/services";

export default defineEventHandler(async (event) => {
  const id = getObjectIdOrThrow(getRouterParam(event, "id"));
  const company = await getProviderCompany("requests.decide");
  const request = await ServiceRequest.findOneAndUpdate(
    { _id: id, companyId: company._id, status: { $ne: "CONVERTED" } },
    { status: "APPROVED" },
    { returnDocument: "after", runValidators: true },
  ).populate("serviceId");

  if (!request) throw createError({ statusCode: 404, statusMessage: "Service request not found" });

  return request;
});
