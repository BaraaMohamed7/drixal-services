import { Customer } from "../../../models/customer.schema";
import { Service } from "../../../models/service.schema";
import { getObjectIdOrThrow } from "../../../utils/mongodb";
import { getProviderCompany } from "../../../utils/services";

export default defineEventHandler(async (event) => {
  const id = getObjectIdOrThrow(getRouterParam(event, "id"));
  const company = await getProviderCompany("orders.read");
  const order = await ServiceOrder.findOne({ _id: id, companyId: company._id })
    .populate({ path: "customerId", model: Customer })
    .populate({ path: "serviceId", model: Service });

  if (!order) throw createError({ statusCode: 404, statusMessage: "Service order not found" });

  return order;
});
