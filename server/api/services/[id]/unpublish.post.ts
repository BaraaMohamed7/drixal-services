import { getObjectIdOrThrow } from "../../../utils/mongodb";
import { unpublishProviderService } from "../../../utils/services";

export default defineEventHandler(async (event) => {
  const id = getObjectIdOrThrow(getRouterParam(event, "id"));
  return unpublishProviderService(event, id);
});
