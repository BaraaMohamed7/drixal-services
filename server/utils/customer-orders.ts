import type { CompanyDocument } from "../models/company.schema";
import type { ServiceDocument } from "../models/service.schema";
import type { ServiceOrderDocument } from "../models/service-order.schema";

export type CustomerOrderDto = {
  id: string;
  orderNumber: string;
  title: string;
  description: string;
  status: ServiceOrderDocument["status"];
  priority: ServiceOrderDocument["priority"];
  scheduledDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  service: { name: string } | null;
  company: { name: string } | null;
  lines: Array<{
    title: string;
    quantity: number;
    status: ServiceOrderDocument["lines"][number]["status"];
    cost: { amount?: number; currency: string } | null;
  }>;
};

type PopulatedOrder = ServiceOrderDocument & {
  serviceId?: ServiceDocument | null;
  companyId?: CompanyDocument | null;
};

export const mapCustomerOrder = (order: PopulatedOrder): CustomerOrderDto => {
  const service = order.serviceId && typeof order.serviceId === "object" ? order.serviceId : null;
  const company = order.companyId && typeof order.companyId === "object" ? order.companyId : null;

  return {
    id: String(order._id),
    orderNumber: order.orderNumber,
    title: order.title,
    description: order.description,
    status: order.status,
    priority: order.priority,
    scheduledDate: order.scheduledDate,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    service: service ? { name: service.name } : null,
    company: company ? { name: company.name } : null,
    lines: order.lines.map((line) => ({
      title: line.title,
      quantity: line.quantity,
      status: line.status,
      cost: line.cost?.amount !== undefined ? { amount: line.cost.amount, currency: line.cost.currency } : null,
    })),
  };
};