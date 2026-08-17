import { createHash, randomBytes } from "node:crypto";
import { CompanyDomain, reservedSubdomains } from "../../models/company-domain.schema";
import { getCurrentCompany } from "../../utils/session";
import { writeAuditLog } from "../../utils/audit";

const hashToken = (token: string) => createHash("sha256").update(token).digest("base64url");

export default defineEventHandler(async (event) => {
  const company = await getCurrentCompany(event, "domains.create");
  const body = await readBody<{ hostname?: unknown; type?: unknown }>(event);
  const hostname = typeof body?.hostname === "string" ? body.hostname.trim().toLowerCase() : "";
  const type = typeof body?.type === "string" ? body.type.toUpperCase() : "";

  if (!hostname) throw createError({ statusCode: 400, statusMessage: "Hostname is required" });
  if (type !== "SUBDOMAIN" && type !== "CUSTOM") {
    throw createError({ statusCode: 400, statusMessage: "Type must be SUBDOMAIN or CUSTOM" });
  }

  const normalizedHostname = hostname;
  const parts = normalizedHostname.split(".");
  const subdomain = parts.length > 2 ? parts[0] : null;

  if (type === "SUBDOMAIN" && subdomain && reservedSubdomains.includes(subdomain)) {
    throw createError({ statusCode: 409, statusMessage: `Subdomain "${subdomain}" is reserved` });
  }

  const existingDomain = await CompanyDomain.findOne({ normalizedHostname });
  if (existingDomain) {
    throw createError({ statusCode: 409, statusMessage: "Hostname is already registered" });
  }

  const token = randomBytes(32).toString("base64url");
  const domain = await CompanyDomain.create({
    companyId: company._id,
    hostname,
    normalizedHostname,
    type,
    status: "PENDING",
    isPrimary: false,
    verificationToken: hashToken(token),
  });

  setResponseStatus(event, 201);
  await writeAuditLog(event, {
    targetType: "COMPANY",
    targetId: company._id,
    action: "CREATE",
    summary: `Domain "${hostname}" added`,
  });

  return {
    domain: {
      id: domain._id,
      hostname: domain.hostname,
      type: domain.type,
      status: domain.status,
      isPrimary: domain.isPrimary,
    },
    verificationToken: type === "CUSTOM" ? token : undefined,
  };
});
