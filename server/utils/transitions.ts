import { createError } from "h3";
import type { CompanyStatus } from "../models/company.schema";
import type { ServiceOrderStatus } from "../models/service-order.schema";
import type { ServiceRequestStatus } from "../models/service-request.schema";

export const requestDecidableSources: ServiceRequestStatus[] = ["NEW", "UNDER_REVIEW", "CONTACTED"];

export const assertRequestDecidable = (current: ServiceRequestStatus) => {
  if (!requestDecidableSources.includes(current)) {
    throw createError({ statusCode: 409, statusMessage: `Cannot decide a request in status ${current}` });
  }
};

export const orderCreateStatuses: ServiceOrderStatus[] = ["DRAFT", "SCHEDULED"];

export const orderStatusTransitions: Record<ServiceOrderStatus, ServiceOrderStatus[]> = {
  DRAFT: ["SCHEDULED", "CANCELLED"],
  SCHEDULED: ["ASSIGNED", "IN_PROGRESS", "CANCELLED"],
  ASSIGNED: ["IN_PROGRESS", "CANCELLED"],
  IN_PROGRESS: ["ON_HOLD", "COMPLETED", "CANCELLED"],
  ON_HOLD: ["IN_PROGRESS", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
};

export const assertOrderStatusTransition = (current: ServiceOrderStatus, next: ServiceOrderStatus) => {
  if (current === next) return;
  if (!orderStatusTransitions[current].includes(next)) {
    throw createError({ statusCode: 409, statusMessage: `Cannot transition order from ${current} to ${next}` });
  }
};

export const companyStatusTransitions: Record<CompanyStatus, CompanyStatus[]> = {
  SETUP: ["ACTIVE"],
  ACTIVE: ["SUSPENDED"],
  SUSPENDED: ["ACTIVE"],
};

export const assertCompanyStatusTransition = (current: CompanyStatus, next: CompanyStatus) => {
  if (current === next) return;
  if (!companyStatusTransitions[current].includes(next)) {
    throw createError({ statusCode: 409, statusMessage: `Cannot change company from ${current} to ${next}` });
  }
};