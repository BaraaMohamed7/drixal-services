import { CompanyApplication } from "../../models/company-application.schema";
import { requireUser } from "../../utils/auth";
import { writeAuditLog } from "../../utils/audit";

export default defineEventHandler(async (event) => {
  const session = await requireUser(event);
  if (session.isSuperAdmin) {
    throw createError({ statusCode: 403, statusMessage: "Platform administrators cannot submit company applications" });
  }

  const body = await readBody<{
    companyName?: unknown;
    companySlug?: unknown;
    description?: unknown;
    location?: { city?: unknown; area?: unknown };
  }>(event);

  const companyName = typeof body?.companyName === "string" ? body.companyName.trim() : "";
  const companySlug = typeof body?.companySlug === "string" ? body.companySlug.trim().toLowerCase() : "";
  const description = typeof body?.description === "string" ? body.description.trim() : "";
  const city = typeof body?.location?.city === "string" ? body.location.city.trim() : "";
  const area = typeof body?.location?.area === "string" ? body.location.area.trim() : "";

  if (!companyName || companyName.length > 200) throw createError({ statusCode: 400, statusMessage: "Company name is required" });
  if (!companySlug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(companySlug)) {
    throw createError({ statusCode: 400, statusMessage: "A valid company slug is required (lowercase, hyphens only)" });
  }

  const existingSlug = await Company.findOne({ slug: companySlug }).select("_id");
  if (existingSlug) throw createError({ statusCode: 409, statusMessage: "Company slug is already registered" });

  const pendingApplication = await CompanyApplication.findOne({ applicantUserId: session.user._id, status: "PENDING" });
  if (pendingApplication) throw createError({ statusCode: 409, statusMessage: "You already have a pending application" });

  const application = await CompanyApplication.create({
    applicantUserId: session.user._id,
    companyName,
    companySlug,
    description,
    location: { city, area },
  });

  setResponseStatus(event, 201);
  await writeAuditLog(event, {
    targetType: "COMPANY",
    targetId: application._id,
    action: "CREATE",
    summary: `Company application submitted: "${companyName}"`,
  });

  return {
    application: {
      id: application._id,
      companyName: application.companyName,
      companySlug: application.companySlug,
      status: application.status,
      createdAt: application.createdAt,
    },
  };
});
