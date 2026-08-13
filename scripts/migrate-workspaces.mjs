import { existsSync, readFileSync } from "node:fs";
import mongoose from "mongoose";

if (existsSync(".env")) {
  for (const line of readFileSync(".env", "utf8").split("\n")) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (match) process.env[match[1]] ||= match[2].replace(/^['"]|['"]$/g, "");
  }
}

const uri = process.env.NUXT_MONGOOSE_URI || process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI or NUXT_MONGOOSE_URI is required.");

await mongoose.connect(uri);

try {
  const db = mongoose.connection.db;
  const memberships = db.collection("company_memberships");
  const sessions = db.collection("auth_sessions");
  const membershipCollectionExists = await db.listCollections({ name: "company_memberships" }).hasNext();
  const indexes = membershipCollectionExists ? await memberships.indexes() : [];
  const singleUserIndexes = indexes.filter((index) => {
    const keys = Object.keys(index.key || {});
    return keys.length === 1 && keys[0] === "userId";
  });

  for (const index of singleUserIndexes) {
    await memberships.dropIndex(index.name);
  }

  await memberships.createIndex({ companyId: 1, userId: 1 }, { unique: true });
  await memberships.createIndex({ userId: 1, status: 1 });
  const sessionCollectionExists = await db.listCollections({ name: "auth_sessions" }).hasNext();
  const sessionResult = sessionCollectionExists
    ? await sessions.updateMany(
        { activeWorkspaceType: { $exists: false } },
        { $set: { activeWorkspaceType: "PERSONAL" }, $unset: { activeCompanyId: "" } },
      )
    : { modifiedCount: 0 };

  console.log(JSON.stringify({ droppedIndexes: singleUserIndexes.map((index) => index.name), sessionsBackfilled: sessionResult.modifiedCount }, null, 2));
} finally {
  await mongoose.disconnect();
}
