import { CompanyMembership } from "../../models/company-membership.schema";
import { User } from "../../models/user.schema";
import { isDuplicateKeyError, normalizeCompanyRegistrationInput } from "../../utils/companies";

export default defineEventHandler(async (event) => {
  const input = normalizeCompanyRegistrationInput((await readBody(event)) || {});
  const [existingCompany, existingUser] = await Promise.all([
    Company.findOne({ slug: input.company.slug }).select("_id"),
    User.findOne({ email: input.owner.email }).select("_id"),
  ]);

  if (existingCompany) throw createError({ statusCode: 409, statusMessage: "Company slug is already registered" });
  if (existingUser) throw createError({ statusCode: 409, statusMessage: "Owner email is already registered" });

  let company;
  let user;
  try {
    company = await Company.create(input.company);
    user = await User.create({ ...input.owner, status: "ACTIVE", platformRole: "USER" });
    await CompanyMembership.create({ companyId: company._id, userId: user._id, role: "OWNER", status: "ACTIVE" });
  } catch (error) {
    if (company?._id) await Company.deleteOne({ _id: company._id });
    if (user?._id) await User.deleteOne({ _id: user._id });
    if (isDuplicateKeyError(error)) throw createError({ statusCode: 409, statusMessage: "Company or owner is already registered" });
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
    owner: {
      name: user.name,
      email: user.email,
    },
  };
});
