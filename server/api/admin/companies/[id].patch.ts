import { normalizeCompanyReviewStatus } from "../../../utils/companies";
import { getObjectIdOrThrow } from "../../../utils/mongodb";
import { requirePermission } from "../../../utils/session";

export default defineEventHandler(async (event) => {
  await requirePermission("companies.review");
  const id = getObjectIdOrThrow(getRouterParam(event, "id"));
  const body = await readBody<{ status?: unknown }>(event);
  const status = normalizeCompanyReviewStatus(body?.status);
  const company = await Company.findByIdAndUpdate(id, { status }, { returnDocument: "after", runValidators: true });

  if (!company) throw createError({ statusCode: 404, statusMessage: "Company not found" });
  return company;
});
