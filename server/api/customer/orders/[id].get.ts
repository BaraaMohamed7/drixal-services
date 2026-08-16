import { Customer } from "../../../models/customer.schema";
import { Service } from "../../../models/service.schema";
import { requireUser } from "../../../utils/auth";
import { getObjectIdOrThrow } from "../../../utils/mongodb";
import { mapCustomerOrder, type CustomerOrderDto } from "../../../utils/customer-orders";
import type { ServiceOrderDocument } from "../../../models/service-order.schema";
import type { CompanyDocument } from "../../../models/company.schema";
import type { ServiceDocument } from "../../../models/service.schema";

export default defineEventHandler(async (event): Promise<CustomerOrderDto> => {
  const session = await requireUser(event);
  const id = getObjectIdOrThrow(getRouterParam(event, "id"));
  const order = await ServiceOrder.findOne({ _id: id, customerUserId: session.user._id })
    .populate({ path: "customerId", model: Customer })
    .populate({ path: "serviceId", model: Service })
    .populate("companyId");
  if (!order) throw createError({ statusCode: 404, statusMessage: "Service order not found" });
  return mapCustomerOrder(order as unknown as ServiceOrderDocument & { serviceId?: ServiceDocument | null; companyId?: CompanyDocument | null });
});