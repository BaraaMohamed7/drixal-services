import { getObjectIdOrThrow } from "../../../utils/mongodb";
import { publishProviderService } from "../../../utils/services";
import { writeAuditLog } from "../../../utils/audit";

export default defineEventHandler(async (event) => {
  const id = getObjectIdOrThrow(getRouterParam(event, "id"));
  const service = await publishProviderService(event, id);
  await writeAuditLog(event, {
    targetType: "SERVICE",
    targetId: service._id,
    action: "PUBLISH",
    summary: `Service "${service.name}" published`,
  });
  return service;
});
