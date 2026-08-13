import { Customer } from "../../../models/customer.schema";
import { Service } from "../../../models/service.schema";
import { requireUser } from "../../../utils/auth";
import { getObjectIdOrThrow } from "../../../utils/mongodb";

export default defineEventHandler(async (event) => {
  const session = await requireUser(event);
  const id = getObjectIdOrThrow(getRouterParam(event, "id"));
  const order = await ServiceOrder.findOne({ _id: id, customerUserId: session.user._id })
    .populate({ path: "customerId", model: Customer })
    .populate({ path: "serviceId", model: Service })
    .populate("companyId");
  if (!order) throw createError({ statusCode: 404, statusMessage: "Service order not found" });
  return order;
});
