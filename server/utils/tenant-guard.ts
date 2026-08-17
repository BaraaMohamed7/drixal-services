import type { H3Event } from "h3";
import type { TenantContext } from "./tenant";

export const getTenant = (event: H3Event): TenantContext => {
  const tenant = event.context.tenant;
  if (!tenant) throw createError({ statusCode: 500, statusMessage: "Tenant context not resolved" });
  return tenant;
};

export const requirePlatformTenant = (event: H3Event) => {
  const tenant = getTenant(event);
  if (tenant.kind !== "PLATFORM") {
    throw createError({ statusCode: 403, statusMessage: "This endpoint is only accessible from the platform domain" });
  }
  return tenant;
};

export const requireCompanyTenant = (event: H3Event) => {
  const tenant = getTenant(event);
  if (tenant.kind !== "COMPANY" || !tenant.company) {
    throw createError({ statusCode: 403, statusMessage: "This endpoint requires a company domain" });
  }
  return tenant;
};
