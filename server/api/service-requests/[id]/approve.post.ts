import { getObjectIdOrThrow } from "../../../utils/mongodb";
import { assertRequestDecidable } from "../../../utils/service-requests";
import { getProviderCompany } from "../../../utils/services";
import { writeAuditLog } from "../../../utils/audit";

export default defineEventHandler(async (event) => {
  const id = getObjectIdOrThrow(getRouterParam(event, "id"));
  const company = await getProviderCompany(event, "requests.update_status");
  const request = await ServiceRequest.findOne({ _id: id, companyId: company._id });

  if (!request) throw createError({ statusCode: 404, statusMessage: "Service request not found" });
  assertRequestDecidable(request.status);

  request.status = "APPROVED";
  await request.save();
  await request.populate("serviceId");
  await writeAuditLog(event, {
    targetType: "SERVICE_REQUEST",
    targetId: request._id,
    action: "APPROVE",
    summary: `Service request ${String(request._id)} approved`,
  });

  return request;
});