import { Customer } from "../../../models/customer.schema";
import { Service } from "../../../models/service.schema";
import type { ServiceOrderStatus } from "../../../models/service-order.schema";
import { getObjectIdOrThrow } from "../../../utils/mongodb";
import { assertOrderStatusTransition, normalizeUpdateServiceOrderInput } from "../../../utils/service-orders";
import { getProviderCompany } from "../../../utils/services";
import { writeAuditLog } from "../../../utils/audit";

export default defineEventHandler(async (event) => {
  const id = getObjectIdOrThrow(getRouterParam(event, "id"));
  const company = await getProviderCompany(event, "orders.manage");
  const body = await readBody(event);
  const update = await normalizeUpdateServiceOrderInput(company._id, body || {});

  const current = await ServiceOrder.findOne({ _id: id, companyId: company._id }).select("status");
  if (!current) throw createError({ statusCode: 404, statusMessage: "Service order not found" });
  if (update.status && update.status !== current.status) {
    assertOrderStatusTransition(current.status, update.status as ServiceOrderStatus);
  }

  const order = await ServiceOrder.findOneAndUpdate({ _id: id, companyId: company._id }, update, {
    returnDocument: "after",
    runValidators: true,
  })
    .populate({ path: "customerId", model: Customer })
    .populate({ path: "serviceId", model: Service });

  if (order) {
    if (update.status && update.status !== current.status) {
      await writeAuditLog(event, {
        targetType: "SERVICE_ORDER",
        targetId: order._id,
        action: "STATUS_CHANGE",
        summary: `Order ${String(order._id)} status changed from ${current.status} to ${update.status}`,
        metadata: { from: current.status, to: update.status },
      });
    }
    if (update.assignedUserId !== undefined) {
      await writeAuditLog(event, {
        targetType: "SERVICE_ORDER",
        targetId: order._id,
        action: "ASSIGN",
        summary: `Order ${String(order._id)} assignment updated`,
      });
    }
  }

  return order;
});