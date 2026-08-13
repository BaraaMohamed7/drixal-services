import { CompanyMembership } from "../../models/company-membership.schema";
import { isDuplicateKeyError, normalizeCompanyRegistrationInput } from "../../utils/companies";
import { requireUser } from "../../utils/auth";

export default defineEventHandler(async (event) => {
  const session = await requireUser(event);
  if (session.user.platformRole === "SUPER_ADMIN") {
    throw createError({ statusCode: 403, statusMessage: "Platform administrators cannot create tenant companies" });
  }
  const input = normalizeCompanyRegistrationInput((await readBody(event)) || {});
  const [existingCompany, existingMembership] = await Promise.all([
    Company.findOne({ slug: input.company.slug }).select("_id"),
    CompanyMembership.findOne({ userId: session.user._id, status: "ACTIVE" }).select("_id"),
  ]);

  if (existingCompany) throw createError({ statusCode: 409, statusMessage: "Company slug is already registered" });
  if (existingMembership) throw createError({ statusCode: 409, statusMessage: "This account already belongs to a company" });

  let company;
  try {
    company = await Company.create(input.company);
    await CompanyMembership.create({ companyId: company._id, userId: session.user._id, role: "OWNER", status: "ACTIVE" });
  } catch (error) {
    if (company?._id) await Company.deleteOne({ _id: company._id });
    if (isDuplicateKeyError(error)) throw createError({ statusCode: 409, statusMessage: "Company is already registered" });
    throw error;
  }

  setResponseStatus(event, 201);
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
