import { existsSync, readFileSync } from "node:fs";
import mongoose from "mongoose";

if (existsSync(".env")) {
  const env = readFileSync(".env", "utf8");

  for (const line of env.split("\n")) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!match) continue;

    const [, key, rawValue] = match;
    process.env[key] ||= rawValue.replace(/^['"]|['"]$/g, "");
  }
}

const uri = process.env.NUXT_MONGOOSE_URI || process.env.MONGODB_URI;

if (!uri) {
  throw new Error("MONGODB_URI or NUXT_MONGOOSE_URI is required to seed data.");
}

const companySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, default: "", trim: true },
    status: { type: String, enum: ["PENDING", "APPROVED", "SUSPENDED"], default: "PENDING" },
    location: {
      city: { type: String, default: "", trim: true },
      area: { type: String, default: "", trim: true },
    },
    rating: { type: Number, default: 0, min: 0, max: 5 },
  },
  { collection: "companies", timestamps: true },
);

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { collection: "service_categories", timestamps: true },
);

const serviceSchema = new mongoose.Schema(
  {
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "ServiceCategory", required: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, lowercase: true, trim: true },
    description: { type: String, required: true, trim: true },
    pricing: {
      type: { type: String, enum: ["FIXED", "HOURLY", "CUSTOM"], default: "FIXED" },
      amount: { type: Number, min: 0 },
      currency: { type: String, default: "EGP", uppercase: true, trim: true },
    },
    duration: { type: Number, min: 0 },
    locationType: { type: String, enum: ["PROVIDER", "CUSTOMER", "REMOTE", "FLEXIBLE"], default: "FLEXIBLE" },
    scheduling: {
      required: { type: Boolean, default: false },
    },
    operationalStatus: { type: String, enum: ["ACTIVE", "INACTIVE"], default: "ACTIVE" },
    publicationStatus: { type: String, enum: ["DRAFT", "PUBLISHED", "UNPUBLISHED"], default: "DRAFT" },
  },
  { collection: "services", timestamps: true },
);

const Company = mongoose.model("Company", companySchema);
const ServiceCategory = mongoose.model("ServiceCategory", categorySchema);
const Service = mongoose.model("Service", serviceSchema);

const companies = [
  {
    name: "Cool Air Services",
    slug: "cool-air-services",
    description: "Residential and commercial AC services in Alexandria.",
    status: "APPROVED",
    location: { city: "Alexandria", area: "Sidi Gaber" },
    rating: 4.7,
  },
  {
    name: "TechFix",
    slug: "techfix",
    description: "Laptop maintenance and remote IT support.",
    status: "APPROVED",
    location: { city: "Alexandria", area: "Smouha" },
    rating: 4.5,
  },
];

const categories = [
  { name: "Automotive", slug: "automotive" },
  { name: "Home Services", slug: "home-services" },
  { name: "IT Services", slug: "it-services" },
  { name: "Professional Services", slug: "professional-services" },
  { name: "Healthcare", slug: "healthcare" },
  { name: "Beauty & Personal Care", slug: "beauty-personal-care" },
];

await mongoose.connect(uri);

try {
  await Promise.all([
    Company.collection.createIndex({ slug: 1 }, { unique: true }),
    ServiceCategory.collection.createIndex({ slug: 1 }, { unique: true }),
    Service.collection.createIndex({ companyId: 1, publicationStatus: 1 }),
    Service.collection.createIndex({ categoryId: 1, publicationStatus: 1 }),
    Service.collection.createIndex({ slug: 1 }),
    Service.collection.createIndex({ companyId: 1, slug: 1 }, { unique: true }),
    Service.collection.createIndex({ name: "text", description: "text" }),
  ]);

  const companyDocs = new Map();
  const categoryDocs = new Map();

  for (const company of companies) {
    const doc = await Company.findOneAndUpdate({ slug: company.slug }, company, {
      upsert: true,
      returnDocument: "after",
      setDefaultsOnInsert: true,
    });
    companyDocs.set(company.slug, doc);
  }

  for (const category of categories) {
    const doc = await ServiceCategory.findOneAndUpdate(
      { slug: category.slug },
      { ...category, isActive: true },
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
    );
    categoryDocs.set(category.slug, doc);
  }

  const services = [
    {
      company: "cool-air-services",
      category: "home-services",
      name: "AC Maintenance",
      slug: "ac-maintenance",
      description: "Preventive AC cleaning, inspection, and performance tuning.",
      pricing: { type: "FIXED", amount: 500, currency: "EGP" },
      duration: 90,
      locationType: "CUSTOMER",
      scheduling: { required: true },
      operationalStatus: "ACTIVE",
      publicationStatus: "PUBLISHED",
    },
    {
      company: "cool-air-services",
      category: "home-services",
      name: "AC Installation",
      slug: "ac-installation",
      description: "Split AC installation with setup and operational testing.",
      pricing: { type: "FIXED", amount: 1200, currency: "EGP" },
      duration: 180,
      locationType: "CUSTOMER",
      scheduling: { required: true },
      operationalStatus: "ACTIVE",
      publicationStatus: "PUBLISHED",
    },
    {
      company: "cool-air-services",
      category: "home-services",
      name: "Emergency AC Repair",
      slug: "emergency-ac-repair",
      description: "Urgent AC diagnosis and repair with custom quotation after inspection.",
      pricing: { type: "CUSTOM", currency: "EGP" },
      duration: 120,
      locationType: "CUSTOMER",
      scheduling: { required: true },
      operationalStatus: "ACTIVE",
      publicationStatus: "PUBLISHED",
    },
    {
      company: "techfix",
      category: "it-services",
      name: "Laptop Maintenance",
      slug: "laptop-maintenance",
      description: "Hardware cleaning, diagnostics, and basic system optimization.",
      pricing: { type: "FIXED", amount: 400, currency: "EGP" },
      duration: 60,
      locationType: "PROVIDER",
      scheduling: { required: true },
      operationalStatus: "ACTIVE",
      publicationStatus: "PUBLISHED",
    },
    {
      company: "techfix",
      category: "it-services",
      name: "Remote IT Support",
      slug: "remote-it-support",
      description: "Remote troubleshooting for software, email, network, and productivity issues.",
      pricing: { type: "HOURLY", amount: 300, currency: "EGP" },
      duration: 60,
      locationType: "REMOTE",
      scheduling: { required: true },
      operationalStatus: "ACTIVE",
      publicationStatus: "PUBLISHED",
    },
  ];

  for (const service of services) {
    const company = companyDocs.get(service.company);
    const category = categoryDocs.get(service.category);

    await Service.findOneAndUpdate(
      { companyId: company._id, slug: service.slug },
      {
        companyId: company._id,
        categoryId: category._id,
        name: service.name,
        slug: service.slug,
        description: service.description,
        pricing: service.pricing,
        duration: service.duration,
        locationType: service.locationType,
        scheduling: service.scheduling,
        operationalStatus: service.operationalStatus,
        publicationStatus: service.publicationStatus,
      },
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
    );
  }

  console.log(`Seeded ${companies.length} companies, ${categories.length} categories, and ${services.length} services.`);
} finally {
  await mongoose.disconnect();
}
