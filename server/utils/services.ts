import {
  locationTypeValues,
  operationalStatusValues,
  pricingTypeValues,
  type LocationType,
  type OperationalStatus,
  type PricingType,
  type PublicationStatus,
} from "../models/service.schema";
import { isValidObjectId, toObjectId } from "./mongodb";
import type { Permission } from "./permissions";
import type { H3Event } from "h3";

export const demoCompanySlug = process.env.DEMO_COMPANY_SLUG || "cool-air-services";

export const normalizeBoolean = (value: unknown): boolean =>
  value === true || value === "true" || value === "1";

export const assertCategoryActive = async (categoryId: unknown) => {
  if (categoryId === undefined || categoryId === null) {
    throw createError({ statusCode: 400, statusMessage: "Category is not active" });
  }
  const id = typeof categoryId === "string" ? categoryId : String(categoryId);
  const category = await ServiceCategory.findOne({ _id: id, isActive: true });
  if (!category) {
    throw createError({ statusCode: 400, statusMessage: "Category is not active" });
  }
  return category;
};

type ServiceInput = {
  categoryId?: unknown;
  name?: unknown;
  slug?: unknown;
  description?: unknown;
  pricing?: {
    type?: unknown;
    amount?: unknown;
    currency?: unknown;
  };
  duration?: unknown;
  locationType?: unknown;
  scheduling?: {
    required?: unknown;
  };
  operationalStatus?: unknown;
  publicationStatus?: unknown;
};

const requiredString = (value: unknown, field: string) => {
  if (typeof value !== "string" || !value.trim()) {
    throw createError({ statusCode: 400, statusMessage: `${field} is required` });
  }

  return value.trim();
};

const optionalString = (value: unknown) => (typeof value === "string" ? value.trim() : undefined);

export const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const getDemoCompany = async () => {
  const company = await Company.findOne({ slug: demoCompanySlug });

  if (!company) {
    throw createError({
      statusCode: 500,
      statusMessage: `Demo company '${demoCompanySlug}' was not found. Run npm run seed.`,
    });
  }

  return company;
};

export const getProviderCompany = async (event: H3Event, permission: Permission) => {
  const { getCurrentCompany } = await import("./session");
  return getCurrentCompany(event, permission);
};

export const normalizeCreateServiceInput = (body: ServiceInput) => {
  const name = requiredString(body.name, "name");
  const slug = slugify(optionalString(body.slug) || name);
  const categoryId = normalizeObjectId(body.categoryId, "categoryId");
  const description = requiredString(body.description, "description");

  return {
    categoryId,
    name,
    slug,
    description,
    pricing: normalizePricing(body.pricing),
    duration: normalizeDuration(body.duration),
    locationType: normalizeLocationType(body.locationType) || "FLEXIBLE",
    scheduling: {
      required: normalizeBoolean(body.scheduling?.required),
    },
    operationalStatus: "ACTIVE" as OperationalStatus,
    publicationStatus: "DRAFT" as PublicationStatus,
  };
};

export const normalizeUpdateServiceInput = (body: ServiceInput) => {
  const update: Record<string, unknown> = {};

  if (body.publicationStatus !== undefined) {
    throw createError({
      statusCode: 400,
      statusMessage: "Use the publish/unpublish endpoints to change publicationStatus",
    });
  }

  if (body.categoryId !== undefined) update.categoryId = normalizeObjectId(body.categoryId, "categoryId");
  if (body.name !== undefined) update.name = requiredString(body.name, "name");
  if (body.slug !== undefined) update.slug = slugify(requiredString(body.slug, "slug"));
  if (body.description !== undefined) update.description = requiredString(body.description, "description");
  if (body.pricing !== undefined) update.pricing = normalizePricing(body.pricing);
  if (body.duration !== undefined) update.duration = normalizeDuration(body.duration);
  if (body.locationType !== undefined) update.locationType = normalizeLocationType(body.locationType);
  if (body.scheduling !== undefined) update.scheduling = { required: normalizeBoolean(body.scheduling.required) };
  if (body.operationalStatus !== undefined) update.operationalStatus = normalizeOperationalStatus(body.operationalStatus);

  return update;
};

export const publishProviderService = async (event: H3Event, id: string) => {
  const company = await getProviderCompany(event, "services.publish");

  if (company.status !== "APPROVED") {
    throw createError({ statusCode: 400, statusMessage: "Company must be APPROVED before publishing services" });
  }

  const service = await Service.findOne({ _id: id, companyId: company._id });

  if (!service) {
    throw createError({ statusCode: 404, statusMessage: "Service not found" });
  }

  if (service.operationalStatus !== "ACTIVE") {
    throw createError({ statusCode: 400, statusMessage: "Only ACTIVE services can be published" });
  }

  const category = await ServiceCategory.findOne({ _id: service.categoryId, isActive: true });

  if (!category) {
    throw createError({ statusCode: 400, statusMessage: "Service category must be active before publishing" });
  }

  service.publicationStatus = "PUBLISHED";
  await service.save();
  await service.populate(["companyId", "categoryId"]);

  return service;
};

export const unpublishProviderService = async (event: H3Event, id: string) => {
  const company = await getProviderCompany(event, "services.publish");
  const service = await Service.findOneAndUpdate(
    { _id: id, companyId: company._id },
    { publicationStatus: "UNPUBLISHED" },
    { returnDocument: "after", runValidators: true },
  )
    .populate("companyId")
    .populate("categoryId");

  if (!service) {
    throw createError({ statusCode: 404, statusMessage: "Service not found" });
  }

  return service;
};

const normalizeObjectId = (value: unknown, field: string) => {
  if (typeof value !== "string" || !isValidObjectId(value)) {
    throw createError({ statusCode: 400, statusMessage: `${field} must be a valid ObjectId` });
  }

  return toObjectId(value);
};

const normalizePricing = (pricing: ServiceInput["pricing"] = {}) => {
  const type = normalizePricingType(pricing.type) || "FIXED";
  const amount = normalizeAmount(pricing.amount);

  if (type !== "CUSTOM" && amount === undefined) {
    throw createError({ statusCode: 400, statusMessage: "pricing.amount is required unless pricing.type is CUSTOM" });
  }

  return {
    type,
    amount,
    currency: optionalString(pricing.currency)?.toUpperCase() || "EGP",
  };
};

const normalizeAmount = (amount: unknown) => {
  if (amount === undefined || amount === null || amount === "") return undefined;

  const value = Number(amount);
  if (!Number.isFinite(value) || value < 0) {
    throw createError({ statusCode: 400, statusMessage: "pricing.amount must be a positive number" });
  }

  return value;
};

const normalizeDuration = (duration: unknown) => {
  if (duration === undefined || duration === null || duration === "") return undefined;

  const value = Number(duration);
  if (!Number.isFinite(value) || value < 0) {
    throw createError({ statusCode: 400, statusMessage: "duration must be a positive number" });
  }

  return value;
};

const normalizePricingType = (type: unknown): PricingType | undefined => {
  if (type === undefined) return undefined;

  if (typeof type !== "string" || !pricingTypeValues.includes(type as PricingType)) {
    throw createError({ statusCode: 400, statusMessage: "pricing.type must be FIXED, HOURLY, or CUSTOM" });
  }

  return type as PricingType;
};

const normalizeLocationType = (locationType: unknown): LocationType | undefined => {
  if (locationType === undefined) return undefined;

  if (typeof locationType !== "string" || !locationTypeValues.includes(locationType as LocationType)) {
    throw createError({ statusCode: 400, statusMessage: "locationType must be PROVIDER, CUSTOMER, REMOTE, or FLEXIBLE" });
  }

  return locationType as LocationType;
};

const normalizeOperationalStatus = (status: unknown): OperationalStatus | undefined => {
  if (status === undefined) return undefined;

  if (typeof status !== "string" || !operationalStatusValues.includes(status as OperationalStatus)) {
    throw createError({ statusCode: 400, statusMessage: "operationalStatus must be ACTIVE or INACTIVE" });
  }

  return status as OperationalStatus;
};

export const duplicateKeyError = (error: unknown) =>
  typeof error === "object" && error !== null && "code" in error && (error as { code?: number }).code === 11000;
