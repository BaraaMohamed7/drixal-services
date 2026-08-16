import { companyStatusValues, type CompanyStatus } from "../models/company.schema";
import { slugify } from "./services";
import { assertCompanyStatusTransition } from "./transitions";

export { assertCompanyStatusTransition };

type RegistrationInput = {
  company?: {
    name?: unknown;
    slug?: unknown;
    description?: unknown;
    city?: unknown;
    area?: unknown;
  };
};

const requiredText = (value: unknown, field: string, maxLength: number) => {
  if (typeof value !== "string" || !value.trim()) {
    throw createError({ statusCode: 400, statusMessage: `${field} is required` });
  }

  const text = value.trim();
  if (text.length > maxLength) throw createError({ statusCode: 400, statusMessage: `${field} is too long` });
  return text;
};

const optionalText = (value: unknown, field: string, maxLength: number) => {
  if (value === undefined || value === null || value === "") return "";
  if (typeof value !== "string") throw createError({ statusCode: 400, statusMessage: `${field} must be a string` });

  const text = value.trim();
  if (text.length > maxLength) throw createError({ statusCode: 400, statusMessage: `${field} is too long` });
  return text;
};

export const normalizeCompanyRegistrationInput = (body: RegistrationInput) => {
  const companyName = requiredText(body.company?.name, "company.name", 120);
  const slug = slugify(optionalText(body.company?.slug, "company.slug", 120) || companyName);

  if (!slug) throw createError({ statusCode: 400, statusMessage: "company.slug must contain letters or numbers" });

  return {
    company: {
      name: companyName,
      slug,
      description: optionalText(body.company?.description, "company.description", 1000),
      location: {
        city: requiredText(body.company?.city, "company.city", 120),
        area: optionalText(body.company?.area, "company.area", 120),
      },
      status: "PENDING" as CompanyStatus,
    },
  };
};

export const normalizeCompanyReviewStatus = (value: unknown): CompanyStatus => {
  const reviewableStatuses: CompanyStatus[] = ["APPROVED", "REJECTED", "SUSPENDED"];
  if (typeof value !== "string" || !companyStatusValues.includes(value as CompanyStatus) || !reviewableStatuses.includes(value as CompanyStatus)) {
    throw createError({ statusCode: 400, statusMessage: "status must be APPROVED, REJECTED, or SUSPENDED" });
  }

  return value as CompanyStatus;
};

export const isDuplicateKeyError = (error: unknown) =>
  typeof error === "object" && error !== null && "code" in error && (error as { code?: number }).code === 11000;
