import { serviceOrderPriorityValues, serviceOrderStatusValues } from "../models/service-order.schema";
import { isValidObjectId } from "./mongodb";

type ServiceOrderInput = {
  customerId?: unknown;
  serviceId?: unknown;
  requestId?: unknown;
  title?: unknown;
  description?: unknown;
  priority?: unknown;
  status?: unknown;
  scheduledDate?: unknown;
  assignedTo?: unknown;
};

const requiredString = (value: unknown, field: string) => {
  if (typeof value !== "string" || !value.trim()) {
    throw createError({ statusCode: 400, statusMessage: `${field} is required` });
  }

  return value.trim();
};

const optionalString = (value: unknown) => (typeof value === "string" ? value.trim() : "");

const objectIdString = (value: unknown, field: string) => {
  const id = requiredString(value, field);
  if (!isValidObjectId(id)) {
    throw createError({ statusCode: 400, statusMessage: `${field} must be a valid ObjectId` });
  }

  return id;
};

const normalizeDate = (value: unknown) => {
  const date = optionalString(value);
  return date ? new Date(date) : undefined;
};

const normalizePriority = (value: unknown) => {
  if (value === undefined || value === "") return "MEDIUM";
  if (typeof value !== "string" || !serviceOrderPriorityValues.includes(value as (typeof serviceOrderPriorityValues)[number])) {
    throw createError({ statusCode: 400, statusMessage: "priority is invalid" });
  }
  return value;
};

const normalizeStatus = (value: unknown) => {
  if (value === undefined || value === "") return "DRAFT";
  if (typeof value !== "string" || !serviceOrderStatusValues.includes(value as (typeof serviceOrderStatusValues)[number])) {
    throw createError({ statusCode: 400, statusMessage: "status is invalid" });
  }
  return value;
};

export const nextOrderNumber = async (companyId: unknown) => {
  const count = await ServiceOrder.countDocuments({ companyId });
  return `SO-${String(count + 1001).padStart(4, "0")}`;
};

export const normalizeCreateServiceOrderInput = async (companyId: unknown, body: ServiceOrderInput) => ({
  customerId: objectIdString(body.customerId, "customerId"),
  serviceId: objectIdString(body.serviceId, "serviceId"),
  requestId: optionalString(body.requestId) || undefined,
  orderNumber: await nextOrderNumber(companyId),
  title: requiredString(body.title, "title"),
  description: optionalString(body.description),
  priority: normalizePriority(body.priority),
  status: normalizeStatus(body.status),
  scheduledDate: normalizeDate(body.scheduledDate),
  assignedTo: optionalString(body.assignedTo),
});
