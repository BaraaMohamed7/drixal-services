import { Customer } from "../../../models/customer.schema";
import { Service } from "../../../models/service.schema";
import { requireUser } from "../../../utils/auth";
import { mapCustomerOrder, type CustomerOrderDto } from "../../../utils/customer-orders";
import type { ServiceOrderDocument } from "../../../models/service-order.schema";
import type { CompanyDocument } from "../../../models/company.schema";
import type { ServiceDocument } from "../../../models/service.schema";

export default defineEventHandler(async (event): Promise<{ items: CustomerOrderDto[] }> => {
  const session = await requireUser(event);
  const items = await ServiceOrder.find({ customerUserId: session.user._id })
    .populate({ path: "customerId", model: Customer })
    .populate({ path: "serviceId", model: Service })
    .populate("companyId")
    .sort({ createdAt: -1 })
    .limit(100);
  return {
    items: items.map((order) =>
      mapCustomerOrder(order as unknown as ServiceOrderDocument & { serviceId?: ServiceDocument | null; companyId?: CompanyDocument | null }),
    ),
  };
});