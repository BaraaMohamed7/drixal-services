import { Customer } from "../../../models/customer.schema";
import { Service } from "../../../models/service.schema";
import { getObjectIdOrThrow } from "../../../utils/mongodb";
import { normalizeUpdateServiceOrderInput } from "../../../utils/service-orders";
import { getProviderCompany } from "../../../utils/services";

export default defineEventHandler(async (event) => {
  const id = getObjectIdOrThrow(getRouterParam(event, "id"));
  const company = await getProviderCompany(event, "orders.manage");
  const body = await readBody(event);
  const update = normalizeUpdateServiceOrderInput(body || {});
  const order = await ServiceOrder.findOneAndUpdate({ _id: id, companyId: company._id }, update, {
    returnDocument: "after",
    runValidators: true,
  })
    .populate({ path: "customerId", model: Customer })
    .populate({ path: "serviceId", model: Service });

  if (!order) throw createError({ statusCode: 404, statusMessage: "Service order not found" });

  return order;
});
