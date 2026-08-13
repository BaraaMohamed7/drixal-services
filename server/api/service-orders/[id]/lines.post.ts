import { Customer } from "../../../models/customer.schema";
import { Service } from "../../../models/service.schema";
import { getObjectIdOrThrow } from "../../../utils/mongodb";
import { normalizeCreateServiceOrderLineInput } from "../../../utils/service-orders";
import { getDemoCompany } from "../../../utils/services";

export default defineEventHandler(async (event) => {
  const id = getObjectIdOrThrow(getRouterParam(event, "id"));
  const company = await getDemoCompany();
  const body = await readBody(event);
  const line = normalizeCreateServiceOrderLineInput(body || {});
  const order = await ServiceOrder.findOneAndUpdate(
    { _id: id, companyId: company._id },
    { $push: { lines: line } },
    { returnDocument: "after", runValidators: true },
  )
    .populate({ path: "customerId", model: Customer })
    .populate({ path: "serviceId", model: Service });

  if (!order) throw createError({ statusCode: 404, statusMessage: "Service order not found" });

  setResponseStatus(event, 201);
  return order;
});
