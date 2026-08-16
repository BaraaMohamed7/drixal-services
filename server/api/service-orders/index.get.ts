import { Customer } from "../../models/customer.schema";
import { Service } from "../../models/service.schema";
import { requirePermission } from "../../utils/session";
import { escapeRegExp } from "../../utils/mongodb";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const session = await requirePermission(event, "orders.read");
  const company = session.company;
  if (!company) throw createError({ statusCode: 403, statusMessage: "Active company membership required" });
  const filter: Record<string, unknown> = { companyId: company._id };
  if (session.membership?.role === "TECHNICIAN") filter.assignedUserId = session.user._id;

  if (typeof query.status === "string" && query.status) filter.status = query.status;
  if (typeof query.priority === "string" && query.priority) filter.priority = query.priority;
  if (typeof query.search === "string" && query.search.trim()) {
    const search = query.search.trim();
    filter.$or = [{ orderNumber: new RegExp(escapeRegExp(search), "i") }, { title: new RegExp(escapeRegExp(search), "i") }, { assignedTo: new RegExp(escapeRegExp(search), "i") }];
  }

  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || 20, 1), 100);

  const [items, total] = await Promise.all([
    ServiceOrder.find(filter)
      .populate({ path: "customerId", model: Customer })
      .populate({ path: "serviceId", model: Service })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    ServiceOrder.countDocuments(filter),
  ]);

  return {
    items,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
});
