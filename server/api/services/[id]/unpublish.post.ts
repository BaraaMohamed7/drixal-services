import { getObjectIdOrThrow } from "../../../utils/mongodb";
import { unpublishProviderService } from "../../../utils/services";
import { writeAuditLog } from "../../../utils/audit";

export default defineEventHandler(async (event) => {
  const id = getObjectIdOrThrow(getRouterParam(event, "id"));
  const service = await unpublishProviderService(event, id);
  await writeAuditLog(event, {
    targetType: "SERVICE",
    targetId: service._id,
    action: "UNPUBLISH",
    summary: `Service "${service.name}" unpublished`,
  });
  return service;
});
