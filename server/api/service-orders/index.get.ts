import { Customer } from "../../models/customer.schema";
import { Service } from "../../models/service.schema";
import { getProviderCompany } from "../../utils/services";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const company = await getProviderCompany("orders.read");
  const filter: Record<string, unknown> = { companyId: company._id };

  if (typeof query.status === "string" && query.status) filter.status = query.status;
  if (typeof query.priority === "string" && query.priority) filter.priority = query.priority;
  if (typeof query.search === "string" && query.search.trim()) {
    const search = query.search.trim();
    filter.$or = [{ orderNumber: new RegExp(search, "i") }, { title: new RegExp(search, "i") }, { assignedTo: new RegExp(search, "i") }];
  }

  const items = await ServiceOrder.find(filter)
    .populate({ path: "customerId", model: Customer })
    .populate({ path: "serviceId", model: Service })
    .sort({ createdAt: -1 })
    .limit(100);

  return { items };
});
