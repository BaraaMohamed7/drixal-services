import { getObjectIdOrThrow } from "../../../utils/mongodb";
import { publishProviderService } from "../../../utils/services";

export default defineEventHandler(async (event) => {
  const id = getObjectIdOrThrow(getRouterParam(event, "id"));
  return publishProviderService(event, id);
});
