import { serviceOrderLineStatusValues, serviceOrderPriorityValues, serviceOrderStatusValues, type ServiceOrderLineDocument, type ServiceOrderLineStatus, type ServiceOrderPriority, type ServiceOrderStatus } from "../models/service-order.schema";
import { Customer } from "../models/customer.schema";
import { Service } from "../models/service.schema";
import { ServiceRequest } from "../models/service-request.schema";
import { CompanyMembership } from "../models/company-membership.schema";
import { User } from "../models/user.schema";
import { isValidObjectId, toObjectId } from "./mongodb";
import { assertOrderStatusTransition, orderCreateStatuses } from "./transitions";
import type mongoose from "mongoose";

export { assertOrderStatusTransition, orderCreateStatuses };

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
  assignedUserId?: unknown;
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
  assignedUserId?: unknown;
  status?: unknown;
};

type ServiceOrderCreateInput = {
  customerId: string;
  serviceId: string;
  requestId?: string;
  customerUserId?: mongoose.Types.ObjectId;
  orderNumber: string;
  title: string;
  description: string;
  priority: ServiceOrderPriority;
  status: ServiceOrderStatus;
  scheduledDate?: Date;
  assignedTo: string;
  assignedUserId?: mongoose.Types.ObjectId;
  lines: ServiceOrderLineDocument[];
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

const resolveAssignedUser = async (companyId: string | mongoose.Types.ObjectId, userId: string) => {
  const id = toObjectId(userId);
  const membership = await CompanyMembership.findOne({ companyId, userId: id, status: "ACTIVE" }).select("_id");
  if (!membership) throw createError({ statusCode: 400, statusMessage: "assignedUserId is not an active member of this company" });

  const user = await User.findById(id).select("name");
  if (!user) throw createError({ statusCode: 400, statusMessage: "assignedUserId is invalid" });

  return user;
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

const normalizePriority = (value: unknown): ServiceOrderPriority => {
  if (value === undefined || value === "") return "MEDIUM";
  if (typeof value !== "string" || !serviceOrderPriorityValues.includes(value as ServiceOrderPriority)) {
    throw createError({ statusCode: 400, statusMessage: "priority is invalid" });
  }
  return value as ServiceOrderPriority;
};

const normalizeStatus = (value: unknown): ServiceOrderStatus => {
  if (value === undefined || value === "") return "DRAFT";
  if (typeof value !== "string" || !serviceOrderStatusValues.includes(value as ServiceOrderStatus)) {
    throw createError({ statusCode: 400, statusMessage: "status is invalid" });
  }
  return value as ServiceOrderStatus;
};

const normalizeCreateStatus = (value: unknown): ServiceOrderStatus => {
  const status = normalizeStatus(value);
  if (!orderCreateStatuses.includes(status)) {
    throw createError({ statusCode: 400, statusMessage: "status must be DRAFT or SCHEDULED when creating an order" });
  }
  return status;
};

export const nextOrderNumber = async (companyId: string | mongoose.Types.ObjectId) => {
  const count = await ServiceOrder.countDocuments({ companyId });
  return `SO-${String(count + 1001).padStart(4, "0")}`;
};

export const normalizeCreateServiceOrderInput = async (companyId: string | mongoose.Types.ObjectId, body: ServiceOrderInput): Promise<ServiceOrderCreateInput> => {
  const customerId = objectIdString(body.customerId, "customerId");
  const serviceId = objectIdString(body.serviceId, "serviceId");
  const requestId = body.requestId ? objectIdString(body.requestId, "requestId") : undefined;
  const [customer, service, request] = await Promise.all([
    Customer.findOne({ _id: customerId, companyId }).select("userId"),
    Service.exists({ _id: serviceId, companyId }),
    requestId ? ServiceRequest.findOne({ _id: requestId, companyId }).select("customerId serviceId") : Promise.resolve(null),
  ]);

  if (!customer) throw createError({ statusCode: 400, statusMessage: "customerId does not belong to this company" });
  if (!service) throw createError({ statusCode: 400, statusMessage: "serviceId does not belong to this company" });
  if (requestId && !request) throw createError({ statusCode: 400, statusMessage: "requestId does not belong to this company" });
  if (request && String(request.serviceId) !== serviceId) {
    throw createError({ statusCode: 400, statusMessage: "requestId does not reference the selected service" });
  }
  if (request?.customerId && String(request.customerId) !== customerId) {
    throw createError({ statusCode: 400, statusMessage: "requestId does not reference the selected customer" });
  }

  let assignedTo = optionalString(body.assignedTo);
  let assignedUserId: mongoose.Types.ObjectId | undefined;
  if (body.assignedUserId !== undefined && body.assignedUserId !== null && body.assignedUserId !== "") {
    const user = await resolveAssignedUser(companyId, objectIdString(body.assignedUserId, "assignedUserId"));
    assignedUserId = user._id;
    if (!assignedTo) assignedTo = user.name;
  }

  return {
    customerId,
    serviceId,
    requestId,
    customerUserId: customer.userId,
    orderNumber: await nextOrderNumber(companyId),
    title: requiredString(body.title, "title"),
    description: optionalString(body.description),
    priority: normalizePriority(body.priority),
    status: normalizeCreateStatus(body.status),
    scheduledDate: normalizeDate(body.scheduledDate),
    assignedTo,
    assignedUserId,
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
    status: status as ServiceOrderLineStatus,
    cost: {
      amount: normalizePositiveNumber(body.cost?.amount, "cost.amount"),
      currency: optionalString(body.cost?.currency).toUpperCase() || "EGP",
    },
  };
};

export const normalizeUpdateServiceOrderInput = async (companyId: string | mongoose.Types.ObjectId, body: ServiceOrderUpdateInput) => {
  const update: Record<string, unknown> = {};

  if (body.scheduledDate !== undefined) update.scheduledDate = normalizeDate(body.scheduledDate);
  if (body.assignedTo !== undefined) update.assignedTo = optionalString(body.assignedTo);
  if (body.assignedUserId !== undefined) {
    if (body.assignedUserId === null || body.assignedUserId === "") {
      update.assignedUserId = null;
    } else {
      const user = await resolveAssignedUser(companyId, objectIdString(body.assignedUserId, "assignedUserId"));
      update.assignedUserId = user._id;
      if (body.assignedTo === undefined) update.assignedTo = user.name;
    }
  }
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
