import { isValidObjectId } from "../../../../utils/mongodb";
import { upsertCustomerFromRequest } from "../../../../utils/customers";
import { normalizeCreateServiceRequestInput } from "../../../../utils/service-requests";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const serviceFilter = isValidObjectId(id)
    ? { _id: id, publicationStatus: "PUBLISHED", operationalStatus: "ACTIVE" }
    : { slug: id, publicationStatus: "PUBLISHED", operationalStatus: "ACTIVE" };
  const service = await Service.findOne(serviceFilter).populate("companyId");
  const company = service?.companyId;
  const companyStatus = typeof company === "object" && company !== null && "status" in company ? company.status : undefined;

  if (!service || companyStatus !== "APPROVED") {
    throw createError({ statusCode: 404, statusMessage: "Service not found" });
  }

  const body = await readBody(event);
  const input = normalizeCreateServiceRequestInput(body || {});
  await upsertCustomerFromRequest(service.companyId, input.customer);
  const request = await ServiceRequest.create({
    ...input,
    companyId: service.companyId,
    serviceId: service._id,
  });

  setResponseStatus(event, 201);
  return request.populate(["companyId", "serviceId"]);
});
