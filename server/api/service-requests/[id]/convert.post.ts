import { upsertCustomerFromRequest } from "../../../utils/customers";
import { getObjectIdOrThrow } from "../../../utils/mongodb";
import { normalizeCreateServiceOrderInput } from "../../../utils/service-orders";
import { getDemoCompany } from "../../../utils/services";

export default defineEventHandler(async (event) => {
  const id = getObjectIdOrThrow(getRouterParam(event, "id"));
  const company = await getDemoCompany();
  const request = await ServiceRequest.findOne({ _id: id, companyId: company._id }).populate("serviceId");

  if (!request) throw createError({ statusCode: 404, statusMessage: "Service request not found" });
  if (request.status === "CONVERTED") throw createError({ statusCode: 400, statusMessage: "Service request has already been converted" });

  const service = request.serviceId as { _id?: unknown; name?: string } | undefined;
  const customer = await upsertCustomerFromRequest(company._id, request.customer);
  const orderInput = await normalizeCreateServiceOrderInput(company._id, {
    customerId: String(customer._id),
    serviceId: String(service?._id || request.serviceId),
    requestId: String(request._id),
    title: service?.name || "Service order",
    description: request.message,
    priority: "MEDIUM",
    status: "SCHEDULED",
    scheduledDate: request.preferredDate ? new Date(request.preferredDate).toISOString() : undefined,
  });
  const order = await ServiceOrder.create({ companyId: company._id, ...orderInput });

  request.status = "CONVERTED";
  await request.save();

  setResponseStatus(event, 201);
  return order.populate(["customerId", "serviceId", "requestId"]);
});
