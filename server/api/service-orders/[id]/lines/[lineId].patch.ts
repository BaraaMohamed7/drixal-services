import { Customer } from "../../../../models/customer.schema";
import { Service } from "../../../../models/service.schema";
import { getObjectIdOrThrow } from "../../../../utils/mongodb";
import { normalizeAssignServiceOrderLineInput } from "../../../../utils/service-orders";
import { getProviderCompany } from "../../../../utils/services";

export default defineEventHandler(async (event) => {
  const id = getObjectIdOrThrow(getRouterParam(event, "id"));
  const lineId = getObjectIdOrThrow(getRouterParam(event, "lineId"));
  const company = await getProviderCompany("orders.manage");
  const body = await readBody(event);
  const update = normalizeAssignServiceOrderLineInput(body || {});
  const order = await ServiceOrder.findOneAndUpdate({ _id: id, companyId: company._id, "lines._id": lineId }, { $set: update }, {
    returnDocument: "after",
    runValidators: true,
  })
    .populate({ path: "customerId", model: Customer })
    .populate({ path: "serviceId", model: Service });

  if (!order) throw createError({ statusCode: 404, statusMessage: "Service order line not found" });

  return order;
});
