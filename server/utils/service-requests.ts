type RequestInput = {
  customer?: {
    name?: unknown;
    phone?: unknown;
    email?: unknown;
    city?: unknown;
  };
  message?: unknown;
  preferredDate?: unknown;
};

const requiredString = (value: unknown, field: string) => {
  if (typeof value !== "string" || !value.trim()) {
    throw createError({ statusCode: 400, statusMessage: `${field} is required` });
  }

  return value.trim();
};

const optionalString = (value: unknown) => (typeof value === "string" ? value.trim() : "");

export const normalizeCreateServiceRequestInput = (body: RequestInput) => {
  const customer = body.customer || {};
  const preferredDate = optionalString(body.preferredDate);

  return {
    customer: {
      name: requiredString(customer.name, "customer.name"),
      phone: requiredString(customer.phone, "customer.phone"),
      email: optionalString(customer.email),
      city: optionalString(customer.city),
    },
    message: requiredString(body.message, "message"),
    preferredDate: preferredDate ? new Date(preferredDate) : undefined,
    status: "NEW",
  };
};
