import { serviceOrderLineStatusValues, serviceOrderPriorityValues, serviceOrderStatusValues } from "../models/service-order.schema";
import { Customer } from "../models/customer.schema";
import { Service } from "../models/service.schema";
import { ServiceRequest } from "../models/service-request.schema";
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

type ServiceOrderLineInput = {
  title?: unknown;
  quantity?: unknown;
  assignedTo?: unknown;
  status?: unknown;
  cost?: {
    amount?: unknown;
    currency?: unknown;
  };
};

type ServiceOrderUpdateInput = {
  scheduledDate?: unknown;
  assignedTo?: unknown;
  status?: unknown;
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

const normalizePositiveNumber = (value: unknown, field: string, fallback?: number) => {
  if (value === undefined || value === null || value === "") return fallback;
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0) {
    throw createError({ statusCode: 400, statusMessage: `${field} must be a positive number` });
  }
  return number;
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

export const normalizeCreateServiceOrderInput = async (companyId: unknown, body: ServiceOrderInput) => {
  const customerId = objectIdString(body.customerId, "customerId");
  const serviceId = objectIdString(body.serviceId, "serviceId");
  const requestId = body.requestId ? objectIdString(body.requestId, "requestId") : undefined;
  const [customer, service, request] = await Promise.all([
    Customer.exists({ _id: customerId, companyId }),
    Service.exists({ _id: serviceId, companyId }),
    requestId ? ServiceRequest.exists({ _id: requestId, companyId }) : Promise.resolve(true),
  ]);

  if (!customer) throw createError({ statusCode: 400, statusMessage: "customerId does not belong to this company" });
  if (!service) throw createError({ statusCode: 400, statusMessage: "serviceId does not belong to this company" });
  if (!request) throw createError({ statusCode: 400, statusMessage: "requestId does not belong to this company" });

  return {
    customerId,
    serviceId,
    requestId,
    orderNumber: await nextOrderNumber(companyId),
    title: requiredString(body.title, "title"),
    description: optionalString(body.description),
    priority: normalizePriority(body.priority),
    status: normalizeStatus(body.status),
    scheduledDate: normalizeDate(body.scheduledDate),
    assignedTo: optionalString(body.assignedTo),
    lines: [
      {
        title: requiredString(body.title, "title"),
        quantity: 1,
        assignedTo: optionalString(body.assignedTo),
        status: "PENDING",
        cost: { currency: "EGP" },
      },
    ],
  };
};

export const normalizeCreateServiceOrderLineInput = (body: ServiceOrderLineInput) => {
  const status = body.status === undefined || body.status === "" ? "PENDING" : body.status;
  if (typeof status !== "string" || !serviceOrderLineStatusValues.includes(status as (typeof serviceOrderLineStatusValues)[number])) {
    throw createError({ statusCode: 400, statusMessage: "line status is invalid" });
  }

  return {
    title: requiredString(body.title, "title"),
    quantity: normalizePositiveNumber(body.quantity, "quantity", 1),
    assignedTo: optionalString(body.assignedTo),
    status,
    cost: {
      amount: normalizePositiveNumber(body.cost?.amount, "cost.amount"),
      currency: optionalString(body.cost?.currency).toUpperCase() || "EGP",
    },
  };
};

export const normalizeUpdateServiceOrderInput = (body: ServiceOrderUpdateInput) => {
  const update: Record<string, unknown> = {};

  if (body.scheduledDate !== undefined) update.scheduledDate = normalizeDate(body.scheduledDate);
  if (body.assignedTo !== undefined) update.assignedTo = optionalString(body.assignedTo);
  if (body.status !== undefined) update.status = normalizeStatus(body.status);

  return update;
};

export const normalizeAssignServiceOrderLineInput = (body: ServiceOrderLineInput) => {
  const update: Record<string, unknown> = {};

  if (body.assignedTo !== undefined) update["lines.$.assignedTo"] = optionalString(body.assignedTo);
  if (body.status !== undefined) {
    const status = body.status === "" || body.status === undefined ? "PENDING" : body.status;
    if (typeof status !== "string" || !serviceOrderLineStatusValues.includes(status as (typeof serviceOrderLineStatusValues)[number])) {
      throw createError({ statusCode: 400, statusMessage: "line status is invalid" });
    }
    update["lines.$.status"] = status;
  }

  return update;
};
