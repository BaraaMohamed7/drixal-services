type CustomerInput = {
  name?: unknown;
  phone?: unknown;
  email?: unknown;
  city?: unknown;
};

const requiredString = (value: unknown, field: string) => {
  if (typeof value !== "string" || !value.trim()) {
    throw createError({ statusCode: 400, statusMessage: `${field} is required` });
  }

  return value.trim();
};

const optionalString = (value: unknown) => (typeof value === "string" ? value.trim() : "");

export const normalizeCustomerInput = (body: CustomerInput) => ({
  name: requiredString(body.name, "name"),
  phone: requiredString(body.phone, "phone"),
  email: optionalString(body.email),
  city: optionalString(body.city),
  status: "ACTIVE",
});

export const upsertCustomerFromRequest = async (companyId: unknown, customer: CustomerInput) => {
  const input = normalizeCustomerInput(customer);

  return Customer.findOneAndUpdate(
    { companyId, phone: input.phone },
    { companyId, ...input },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true, runValidators: true },
  );
};

export const upsertCustomerForUser = async (companyId: unknown, userId: unknown, customer: CustomerInput) => {
  const input = normalizeCustomerInput(customer);
  const existingPhone = await Customer.findOne({ companyId, phone: input.phone, userId: { $ne: userId } }).select("_id userId");
  if (existingPhone) throw createError({ statusCode: 409, statusMessage: "This phone is already registered with the provider" });

  return Customer.findOneAndUpdate(
    { companyId, userId },
    { companyId, userId, ...input },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true, runValidators: true },
  );
};
