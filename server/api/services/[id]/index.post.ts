import { getObjectIdOrThrow } from "../../../utils/mongodb";
import { publishProviderService, unpublishProviderService } from "../../../utils/services";

export default defineEventHandler(async (event) => {
  const id = getObjectIdOrThrow(getRouterParam(event, "id"));
  const body = await readBody<{ action?: string }>(event);

  if (body?.action !== "publish" && body?.action !== "unpublish") {
    throw createError({ statusCode: 400, statusMessage: "action must be publish or unpublish" });
  }

  return body.action === "publish" ? publishProviderService(id) : unpublishProviderService(id);
});
