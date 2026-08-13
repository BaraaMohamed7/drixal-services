import { getObjectIdOrThrow } from "../../../utils/mongodb";
import { publishDemoCompanyService } from "../../../utils/services";

export default defineEventHandler(async (event) => {
  const id = getObjectIdOrThrow(getRouterParam(event, "id"));
  return publishDemoCompanyService(id);
});
