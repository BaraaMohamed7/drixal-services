import { duplicateKeyError, getProviderCompany, normalizeCreateServiceInput } from "../../utils/services";

export default defineEventHandler(async (event) => {
  const company = await getProviderCompany("services.manage");
  const body = await readBody(event);
  const input = normalizeCreateServiceInput(body || {});

  try {
    const service = await Service.create({
      ...input,
      companyId: company._id,
    });

    await service.populate(["companyId", "categoryId"]);
    setResponseStatus(event, 201);
    return service;
  } catch (error) {
    if (duplicateKeyError(error)) {
      throw createError({ statusCode: 409, statusMessage: "Service slug already exists" });
    }

    throw error;
  }
});
