import { existsSync, readFileSync } from "node:fs";
import argon2 from "argon2";
import mongoose from "mongoose";

if (existsSync(".env")) {
  for (const line of readFileSync(".env", "utf8").split("\n")) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (match) process.env[match[1]] ||= match[2].replace(/^['"]|['"]$/g, "");
  }
}

const uri = process.env.NUXT_MONGOOSE_URI || process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI or NUXT_MONGOOSE_URI is required.");

let passwordMap = {};
try {
  passwordMap = JSON.parse(process.env.AUTH_MIGRATION_PASSWORDS || "{}");
} catch {
  throw new Error("AUTH_MIGRATION_PASSWORDS must be a JSON object mapping email addresses to temporary passwords.");
}

await mongoose.connect(uri);

try {
  const db = mongoose.connection.db;
  const users = db.collection("users");
  const memberships = db.collection("company_memberships");
  const customers = db.collection("customers");
  const requests = db.collection("service_requests");
  const orders = db.collection("service_orders");
  const unresolvedUsers = [];
  let passwordsBackfilled = 0;
  let customersLinked = 0;
  let requestsLinked = 0;
  let ordersLinked = 0;

  for await (const user of users.find({ $or: [{ passwordHash: { $exists: false } }, { passwordHash: "" }] })) {
    const password = passwordMap[user.email];
    if (typeof password !== "string" || password.length < 8 || password.length > 128) {
      unresolvedUsers.push(user.email);
      continue;
    }

    const passwordHash = await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 19456,
      timeCost: 2,
      parallelism: 1,
      hashLength: 32,
    });
    await users.updateOne({ _id: user._id }, { $set: { passwordHash } });
    passwordsBackfilled += 1;
  }

  const duplicateMemberships = await memberships
    .aggregate([{ $match: { status: "ACTIVE" } }, { $group: { _id: "$userId", count: { $sum: 1 } } }, { $match: { count: { $gt: 1 } } }])
    .toArray();
  const duplicateOrders = await orders
    .aggregate([
      { $match: { requestId: { $type: "objectId" } } },
      { $group: { _id: { companyId: "$companyId", requestId: "$requestId" }, count: { $sum: 1 }, orderNumbers: { $push: "$orderNumber" } } },
      { $match: { count: { $gt: 1 } } },
    ])
    .toArray();

  if (process.env.AUTH_MIGRATION_LINK_CUSTOMERS === "true") {
    for await (const customer of customers.find({ userId: { $exists: false }, email: { $type: "string", $ne: "" } })) {
      const matchingUsers = await users.find({ email: customer.email.toLowerCase(), status: "ACTIVE" }).limit(2).toArray();
      if (matchingUsers.length !== 1) continue;
      const user = matchingUsers[0];
      const existingLink = await customers.findOne({ companyId: customer.companyId, userId: user._id });
      if (existingLink) continue;

      await customers.updateOne({ _id: customer._id, userId: { $exists: false } }, { $set: { userId: user._id } });
      customersLinked += 1;
      const requestResult = await requests.updateMany(
        { companyId: customer.companyId, "customer.email": customer.email, requesterUserId: { $exists: false } },
        { $set: { customerId: customer._id, requesterUserId: user._id } },
      );
      requestsLinked += requestResult.modifiedCount;
      const orderResult = await orders.updateMany(
        { companyId: customer.companyId, customerId: customer._id, customerUserId: { $exists: false } },
        { $set: { customerUserId: user._id } },
      );
      ordersLinked += orderResult.modifiedCount;
    }
  }

  if (duplicateMemberships.length) {
    console.error(`Found ${duplicateMemberships.length} users with multiple active memberships. Resolve them before creating the single-company index.`);
    process.exitCode = 1;
  } else {
    await memberships.createIndex({ userId: 1 }, { unique: true });
  }

  if (duplicateOrders.length) {
    console.error("Found duplicate orders linked to the same request. Resolve these groups before creating the unique request index:");
    console.error(JSON.stringify(duplicateOrders, null, 2));
    process.exitCode = 1;
  }

  await customers.createIndex({ companyId: 1, userId: 1 }, { unique: true, partialFilterExpression: { userId: { $type: "objectId" } } });
  await orders.createIndex({ companyId: 1, assignedUserId: 1, status: 1 });
  if (!duplicateOrders.length) {
    await orders.createIndex({ companyId: 1, requestId: 1 }, { unique: true, partialFilterExpression: { requestId: { $type: "objectId" } } });
  }

  console.log(JSON.stringify({ passwordsBackfilled, unresolvedUsers, customersLinked, requestsLinked, ordersLinked }, null, 2));
  if (unresolvedUsers.length) {
    console.error("Provide explicit temporary passwords through AUTH_MIGRATION_PASSWORDS and rerun the migration.");
    process.exitCode = 1;
  }
} finally {
  await mongoose.disconnect();
}
