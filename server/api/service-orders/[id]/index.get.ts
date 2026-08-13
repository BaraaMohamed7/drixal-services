import { Customer } from "../../../models/customer.schema";
import { Service } from "../../../models/service.schema";
import { getObjectIdOrThrow } from "../../../utils/mongodb";
import { requirePermission } from "../../../utils/session";

export default defineEventHandler(async (event) => {
  const id = getObjectIdOrThrow(getRouterParam(event, "id"));
  const session = await requirePermission(event, "orders.read");
  const company = session.company;
  if (!company) throw createError({ statusCode: 403, statusMessage: "Active company membership required" });
  const filter: Record<string, unknown> = { _id: id, companyId: company._id };
  if (session.membership?.role === "TECHNICIAN") filter.assignedUserId = session.user._id;
  const order = await ServiceOrder.findOne(filter)
    .populate({ path: "customerId", model: Customer })
    .populate({ path: "serviceId", model: Service });

  if (!order) throw createError({ statusCode: 404, statusMessage: "Service order not found" });

  return order;
});
