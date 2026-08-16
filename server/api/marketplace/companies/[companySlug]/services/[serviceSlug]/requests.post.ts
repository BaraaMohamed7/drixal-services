import { upsertCustomerForUser } from "../../../../../../utils/customers";
import { normalizeCreateServiceRequestInput } from "../../../../../../utils/service-requests";
import { requireUser } from "../../../../../../utils/auth";

export default defineEventHandler(async (event) => {
  const session = await requireUser(event);
  const companySlug = getRouterParam(event, "companySlug");
  const serviceSlug = getRouterParam(event, "serviceSlug");
  const company = await Company.findOne({ slug: companySlug, status: "APPROVED" }).select("_id");

  if (!company) throw createError({ statusCode: 404, statusMessage: "Service not found" });

  const service = await Service.findOne({
    companyId: company._id,
    slug: serviceSlug,
    publicationStatus: "PUBLISHED",
    operationalStatus: "ACTIVE",
  }).select("_id companyId");

  if (!service) throw createError({ statusCode: 404, statusMessage: "Service not found" });

  const body = await readBody(event);
  const input = normalizeCreateServiceRequestInput(body || {});
  const customer = await upsertCustomerForUser(service.companyId, session.user._id, input.customer);
  const request = await ServiceRequest.create({
    ...input,
    companyId: service.companyId,
    serviceId: service._id,
    customerId: customer._id,
    requesterUserId: session.user._id,
  });

  setResponseStatus(event, 201);
  return { id: String(request._id), status: request.status, createdAt: request.createdAt };
});