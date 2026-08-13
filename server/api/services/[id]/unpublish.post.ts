import { getObjectIdOrThrow } from "../../../utils/mongodb";
import { unpublishDemoCompanyService } from "../../../utils/services";

export default defineEventHandler(async (event) => {
  const id = getObjectIdOrThrow(getRouterParam(event, "id"));
  return unpublishDemoCompanyService(id);
});
