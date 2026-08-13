import { Customer } from "../../models/customer.schema";
import { Service } from "../../models/service.schema";
import { normalizeCreateServiceOrderInput } from "../../utils/service-orders";
import { getProviderCompany } from "../../utils/services";

export default defineEventHandler(async (event) => {
  const company = await getProviderCompany("orders.manage");
  const body = await readBody(event);
  const input = await normalizeCreateServiceOrderInput(company._id, body || {});
  const order = await ServiceOrder.create({ companyId: company._id, ...input });

  setResponseStatus(event, 201);
  return order.populate([{ path: "customerId", model: Customer }, { path: "serviceId", model: Service }]);
});
