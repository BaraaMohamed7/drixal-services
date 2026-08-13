import { getObjectIdOrThrow } from "../../../utils/mongodb";
import { duplicateKeyError, getProviderCompany, normalizeUpdateServiceInput } from "../../../utils/services";

export default defineEventHandler(async (event) => {
  const id = getObjectIdOrThrow(getRouterParam(event, "id"));
  const company = await getProviderCompany(event, "services.manage");
  const body = await readBody(event);
  const update = normalizeUpdateServiceInput(body || {});

  try {
    const service = await Service.findOneAndUpdate({ _id: id, companyId: company._id }, update, {
      returnDocument: "after",
      runValidators: true,
    })
      .populate("companyId")
      .populate("categoryId");

    if (!service) {
      throw createError({ statusCode: 404, statusMessage: "Service not found" });
    }

    return service;
  } catch (error) {
    if (duplicateKeyError(error)) {
      throw createError({ statusCode: 409, statusMessage: "Service slug already exists" });
    }

    throw error;
  }
});
