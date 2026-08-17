import { createHash } from "node:crypto";
import { CompanyDomain } from "../../../models/company-domain.schema";
import { getCurrentCompany } from "../../../utils/session";
import { writeAuditLog } from "../../../utils/audit";
import { getObjectIdOrThrow } from "../../../utils/mongodb";

const hashToken = (token: string) => createHash("sha256").update(token).digest("base64url");

export default defineEventHandler(async (event) => {
  const company = await getCurrentCompany(event, "domains.update");
  const id = getObjectIdOrThrow(getRouterParam(event, "id"));
  const body = await readBody<{ token?: unknown }>(event);
  const token = typeof body?.token === "string" ? body.token : "";

  const domain = await CompanyDomain.findOne({ _id: id, companyId: company._id });
  if (!domain) throw createError({ statusCode: 404, statusMessage: "Domain not found" });
  if (domain.status === "VERIFIED") {
    throw createError({ statusCode: 409, statusMessage: "Domain is already verified" });
  }

  if (domain.type === "CUSTOM") {
    if (!token) throw createError({ statusCode: 400, statusMessage: "Verification token is required" });
    if (domain.verificationToken !== hashToken(token)) {
      throw createError({ statusCode: 403, statusMessage: "Invalid verification token" });
    }
  }

  domain.status = "VERIFIED";
  domain.verifiedAt = new Date();
  domain.verificationToken = undefined;
  await domain.save();

  await writeAuditLog(event, {
    targetType: "COMPANY",
    targetId: company._id,
    action: "UPDATE",
    summary: `Domain "${domain.hostname}" verified`,
  });

  return {
    domain: {
      id: domain._id,
      hostname: domain.hostname,
      status: domain.status,
      verifiedAt: domain.verifiedAt,
    },
  };
});
