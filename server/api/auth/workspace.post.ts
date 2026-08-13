import { getAuthContext, requireUser, toSessionDto } from "../../utils/auth";
import { isValidObjectId } from "../../utils/mongodb";

export default defineEventHandler(async (event) => {
  const context = await requireUser(event);
  const body = await readBody<{ type?: unknown; companyId?: unknown }>(event);

  if (body?.type === "PERSONAL") {
    context.authSession.activeWorkspaceType = "PERSONAL";
    context.authSession.activeCompanyId = undefined;
  } else if (body?.type === "PLATFORM") {
    if (context.user.platformRole !== "SUPER_ADMIN") throw createError({ statusCode: 403, statusMessage: "Platform administrator access required" });
    context.authSession.activeWorkspaceType = "PLATFORM";
    context.authSession.activeCompanyId = undefined;
  } else if (body?.type === "COMPANY") {
    const companyId = typeof body.companyId === "string" ? body.companyId : "";
    if (!isValidObjectId(companyId)) throw createError({ statusCode: 400, statusMessage: "A valid companyId is required" });

    const membership = context.memberships.find((item) => String(item.companyId?._id || item.companyId) === companyId);
    if (!membership) throw createError({ statusCode: 403, statusMessage: "Active company membership required" });
    context.authSession.activeWorkspaceType = "COMPANY";
    context.authSession.activeCompanyId = membership.companyId?._id || membership.companyId;
  } else {
    throw createError({ statusCode: 400, statusMessage: "Workspace type must be PERSONAL, COMPANY, or PLATFORM" });
  }

  await context.authSession.save();
  setResponseHeader(event, "cache-control", "no-store");
  return toSessionDto(await getAuthContext(event));
});
