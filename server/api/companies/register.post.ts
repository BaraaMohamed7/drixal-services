import { CompanyMembership } from "../../models/company-membership.schema";
import { isDuplicateKeyError, normalizeCompanyRegistrationInput } from "../../utils/companies";
import { requireUser } from "../../utils/auth";
import { writeAuditLog } from "../../utils/audit";

export default defineEventHandler(async (event) => {
  const session = await requireUser(event);
  if (session.user.platformRole === "SUPER_ADMIN") {
    throw createError({ statusCode: 403, statusMessage: "Platform administrators cannot create tenant companies" });
  }
  const input = normalizeCompanyRegistrationInput((await readBody(event)) || {});
  const existingCompany = await Company.findOne({ slug: input.company.slug }).select("_id");

  if (existingCompany) throw createError({ statusCode: 409, statusMessage: "Company slug is already registered" });

  let company;
  try {
    company = await Company.create(input.company);
    await CompanyMembership.create({ companyId: company._id, userId: session.user._id, role: "OWNER", status: "ACTIVE" });
    session.authSession.activeWorkspaceType = "COMPANY";
    session.authSession.activeCompanyId = company._id;
    await session.authSession.save();
  } catch (error) {
    if (company?._id) {
      await CompanyMembership.deleteOne({ companyId: company._id, userId: session.user._id });
      await Company.deleteOne({ _id: company._id });
    }
    if (isDuplicateKeyError(error)) throw createError({ statusCode: 409, statusMessage: "Company is already registered" });
    throw error;
  }

  setResponseStatus(event, 201);
  await writeAuditLog(event, {
    targetType: "COMPANY",
    targetId: company._id,
    action: "CREATE",
    summary: `Registered company "${company.name}"`,
  });
  return {
    company: {
      _id: company._id,
      name: company.name,
      slug: company.slug,
      status: company.status,
      location: company.location,
    },
  };
});
