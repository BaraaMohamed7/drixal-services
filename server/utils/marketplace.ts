type PopulatedRecord = Record<string, unknown>;

const objectIdString = (value: unknown) => {
  if (value && typeof value === "object" && "toString" in value) return value.toString();
  return String(value || "");
};

const asRecord = (value: unknown): PopulatedRecord => (value && typeof value === "object" ? (value as PopulatedRecord) : {});

const toObject = (value: unknown): unknown =>
  typeof value === "object" && value !== null && typeof (value as { toObject?: unknown }).toObject === "function"
    ? (value as { toObject: () => unknown }).toObject()
    : value;

export const mapMarketplaceService = (service: unknown) => {
  const record = asRecord(toObject(service));
  const company = asRecord(record.companyId);
  const category = asRecord(record.categoryId);
  const pricing = asRecord(record.pricing);
  const scheduling = asRecord(record.scheduling);
  const companyLocation = asRecord(company.location);

  return {
    id: objectIdString(record._id),
    name: record.name,
    slug: record.slug,
    description: record.description,
    pricing: {
      type: pricing.type,
      amount: pricing.amount,
      currency: pricing.currency,
    },
    duration: record.duration,
    locationType: record.locationType,
    scheduling: {
      required: Boolean(scheduling.required),
    },
    company: {
      id: objectIdString(company._id),
      name: company.name,
      slug: company.slug,
      description: company.description,
      rating: company.rating,
      location: {
        city: companyLocation.city,
        area: companyLocation.area,
      },
    },
    category: {
      id: objectIdString(category._id),
      name: category.name,
      slug: category.slug,
    },
  };
};
