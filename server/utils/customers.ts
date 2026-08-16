import type mongoose from "mongoose";

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

export const upsertCustomerFromRequest = async (companyId: string | mongoose.Types.ObjectId, customer: CustomerInput) => {
  const input = normalizeCustomerInput(customer);
  const customerDoc = await Customer.findOneAndUpdate(
    { companyId, phone: input.phone },
    { companyId, ...input },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true, runValidators: true },
  );

  if (!customerDoc) throw createError({ statusCode: 500, statusMessage: "Failed to create customer" });
  return customerDoc;
};

export const upsertCustomerForUser = async (companyId: string | mongoose.Types.ObjectId, userId: string | mongoose.Types.ObjectId, customer: CustomerInput) => {
  const input = normalizeCustomerInput(customer);
  const existingPhone = await Customer.findOne({ companyId, phone: input.phone, userId: { $ne: userId } }).select("_id userId");
  if (existingPhone) throw createError({ statusCode: 409, statusMessage: "This phone is already registered with the provider" });

  const customerDoc = await Customer.findOneAndUpdate(
    { companyId, userId },
    { companyId, userId, ...input },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true, runValidators: true },
  );

  if (!customerDoc) throw createError({ statusCode: 500, statusMessage: "Failed to create customer" });
  return customerDoc;
};
