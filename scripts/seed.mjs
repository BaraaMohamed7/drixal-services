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

const customerSchema = new mongoose.Schema(
  {
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, default: "", trim: true, lowercase: true },
    city: { type: String, default: "", trim: true },
    status: { type: String, enum: ["ACTIVE", "INACTIVE"], default: "ACTIVE" },
  },
  { collection: "customers", timestamps: true },
);

const serviceRequestSchema = new mongoose.Schema(
  {
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true },
    serviceId: { type: mongoose.Schema.Types.ObjectId, ref: "Service", required: true },
    customer: {
      name: { type: String, required: true, trim: true },
      phone: { type: String, required: true, trim: true },
      email: { type: String, default: "", trim: true, lowercase: true },
      city: { type: String, default: "", trim: true },
    },
    message: { type: String, required: true, trim: true },
    preferredDate: { type: Date },
    status: { type: String, enum: ["NEW", "UNDER_REVIEW", "APPROVED", "REJECTED", "CONVERTED", "CANCELLED", "CONTACTED", "CLOSED"], default: "NEW" },
  },
  { collection: "service_requests", timestamps: true },
);

const serviceOrderSchema = new mongoose.Schema(
  {
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true },
    requestId: { type: mongoose.Schema.Types.ObjectId, ref: "ServiceRequest" },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
    serviceId: { type: mongoose.Schema.Types.ObjectId, ref: "Service", required: true },
    orderNumber: { type: String, required: true, trim: true, uppercase: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    priority: { type: String, enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"], default: "MEDIUM" },
    status: { type: String, enum: ["DRAFT", "SCHEDULED", "ASSIGNED", "IN_PROGRESS", "ON_HOLD", "COMPLETED", "CANCELLED"], default: "DRAFT" },
    scheduledDate: { type: Date },
    assignedTo: { type: String, default: "", trim: true },
  },
  { collection: "service_orders", timestamps: true },
);

const Company = mongoose.model("Company", companySchema);
const ServiceCategory = mongoose.model("ServiceCategory", categorySchema);
const Service = mongoose.model("Service", serviceSchema);
const Customer = mongoose.model("Customer", customerSchema);
const ServiceRequest = mongoose.model("ServiceRequest", serviceRequestSchema);
const ServiceOrder = mongoose.model("ServiceOrder", serviceOrderSchema);

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
    Service.collection.createIndex({ companyId: 1, publicationStatus: 1 }),
    Service.collection.createIndex({ categoryId: 1, publicationStatus: 1 }),
    Service.collection.createIndex({ slug: 1 }),
    Service.collection.createIndex({ companyId: 1, slug: 1 }, { unique: true }),
    Service.collection.createIndex({ name: "text", description: "text" }),
    Customer.collection.createIndex({ companyId: 1, phone: 1 }, { unique: true }),
    Customer.collection.createIndex({ companyId: 1, name: 1 }),
    ServiceRequest.collection.createIndex({ companyId: 1, status: 1, createdAt: -1 }),
    ServiceOrder.collection.createIndex({ companyId: 1, status: 1, createdAt: -1 }),
    ServiceOrder.collection.createIndex({ companyId: 1, orderNumber: 1 }, { unique: true }),
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

  const demoCompany = companyDocs.get("cool-air-services");
  const acMaintenance = await Service.findOne({ companyId: demoCompany._id, slug: "ac-maintenance" });
  const acInstallation = await Service.findOne({ companyId: demoCompany._id, slug: "ac-installation" });
  const customers = [
    { name: "ABC Motors", phone: "+201000000001", email: "ops@abcmotors.example", city: "Alexandria" },
    { name: "Delta Co.", phone: "+201000000002", email: "facility@delta.example", city: "Alexandria" },
  ];
  const customerDocs = [];

  for (const customer of customers) {
    const doc = await Customer.findOneAndUpdate(
      { companyId: demoCompany._id, phone: customer.phone },
      { companyId: demoCompany._id, ...customer, status: "ACTIVE" },
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
    );
    customerDocs.push(doc);
  }

  const request = await ServiceRequest.findOneAndUpdate(
    { companyId: demoCompany._id, serviceId: acMaintenance._id, "customer.phone": customers[0].phone },
    {
      companyId: demoCompany._id,
      serviceId: acMaintenance._id,
      customer: customers[0],
      message: "AC unit performance dropped and requires inspection before next week.",
      preferredDate: new Date("2026-08-14"),
      status: "APPROVED",
    },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
  );

  await ServiceOrder.findOneAndUpdate(
    { companyId: demoCompany._id, orderNumber: "SO-1001" },
    {
      companyId: demoCompany._id,
      requestId: request._id,
      customerId: customerDocs[0]._id,
      serviceId: acMaintenance._id,
      orderNumber: "SO-1001",
      title: "AC Maintenance",
      description: "Inspect and clean AC unit for ABC Motors.",
      priority: "HIGH",
      status: "IN_PROGRESS",
      scheduledDate: new Date("2026-08-14"),
      assignedTo: "Ahmed Hassan",
    },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
  );

  await ServiceOrder.findOneAndUpdate(
    { companyId: demoCompany._id, orderNumber: "SO-1002" },
    {
      companyId: demoCompany._id,
      customerId: customerDocs[1]._id,
      serviceId: acInstallation._id,
      orderNumber: "SO-1002",
      title: "AC Installation",
      description: "Install new split AC unit for Delta Co.",
      priority: "MEDIUM",
      status: "SCHEDULED",
      scheduledDate: new Date("2026-08-15"),
      assignedTo: "Omar Ali",
    },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
  );

  console.log(`Seeded ${companies.length} companies, ${categories.length} categories, ${services.length} services, ${customers.length} customers, and 2 service orders.`);
} finally {
  await mongoose.disconnect();
}
