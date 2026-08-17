import { CompanyApplication } from "../../models/company-application.schema";
import { requireUser } from "../../utils/auth";

export default defineEventHandler(async (event) => {
  const session = await requireUser(event);
  if (session.isSuperAdmin) {
    throw createError({ statusCode: 403, statusMessage: "Platform administrators cannot list company applications" });
  }

  const query = getQuery(event);
  const filter: Record<string, unknown> = { applicantUserId: session.user._id };

  if (typeof query.status === "string" && query.status) filter.status = query.status;

  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || 20, 1), 100);

  const [items, total] = await Promise.all([
    CompanyApplication.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    CompanyApplication.countDocuments(filter),
  ]);

  return {
    items: items.map((app) => ({
      id: app._id,
      companyName: app.companyName,
      companySlug: app.companySlug,
      status: app.status,
      rejectionReason: app.rejectionReason,
      createdAt: app.createdAt,
      reviewedAt: app.reviewedAt,
    })),
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
});
