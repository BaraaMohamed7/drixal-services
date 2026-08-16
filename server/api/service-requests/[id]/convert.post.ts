import "../../../models/customer.schema";
import "../../../models/service.schema";
import { upsertCustomerFromRequest } from "../../../utils/customers";
import { writeAuditLog } from "../../../utils/audit";
import { getObjectIdOrThrow } from "../../../utils/mongodb";
import { normalizeCreateServiceOrderInput } from "../../../utils/service-orders";
import { getProviderCompany } from "../../../utils/services";

export default defineEventHandler(async (event) => {
  const id = getObjectIdOrThrow(getRouterParam(event, "id"));
  const company = await getProviderCompany(event, "requests.convert");

  const existing = await ServiceRequest.findOne({ _id: id, companyId: company._id }).select("status");
  if (!existing) throw createError({ statusCode: 404, statusMessage: "Service request not found" });
  if (existing.status !== "APPROVED") throw createError({ statusCode: 409, statusMessage: "Only approved service requests can be converted" });

  const request = await ServiceRequest.findOneAndUpdate(
    { _id: id, companyId: company._id, status: "APPROVED" },
    { status: "CONVERTED" },
    { returnDocument: "after" },
  ).populate("serviceId");

  if (!request) throw createError({ statusCode: 409, statusMessage: "Service request has already been converted" });

  const revertRequest = () => ServiceRequest.updateOne({ _id: id }, { status: "APPROVED" });

  try {
    const service = request.serviceId as { _id?: unknown; name?: string } | undefined;
    const customer = request.customerId
      ? await Customer.findOne({ _id: request.customerId, companyId: company._id })
      : await upsertCustomerFromRequest(company._id, request.customer);
    if (!customer) throw createError({ statusCode: 404, statusMessage: "Customer not found" });

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

    const order = await ServiceOrder.create({ ...orderInput, companyId: company._id, customerUserId: request.requesterUserId || orderInput.customerUserId });
    setResponseStatus(event, 201);
    await writeAuditLog(event, {
      targetType: "SERVICE_REQUEST",
      targetId: request._id,
      action: "CONVERT",
      summary: `Service request ${String(request._id)} converted to order ${String(order._id)}`,
      metadata: { orderId: String(order._id) },
    });
    return order.populate(["customerId", "serviceId", "requestId"]);
  } catch (error) {
    await revertRequest();
    if (typeof error === "object" && error !== null && "code" in error && (error as { code?: number }).code === 11000) {
      throw createError({ statusCode: 409, statusMessage: "Service request has already been converted" });
    }
    throw error;
  }
});