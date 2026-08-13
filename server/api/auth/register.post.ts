import { assertSameOrigin, createAuthSession, hashPassword } from "../../utils/auth";
import { User } from "../../models/user.schema";

export default defineEventHandler(async (event) => {
  assertSameOrigin(event);
  const body = await readBody<{ name?: unknown; email?: unknown; password?: unknown }>(event);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!name || name.length > 120) throw createError({ statusCode: 400, statusMessage: "Name is required" });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw createError({ statusCode: 400, statusMessage: "A valid email is required" });
  if (await User.exists({ email })) throw createError({ statusCode: 409, statusMessage: "An account already exists for this email" });

  const user = await User.create({ name, email, passwordHash: await hashPassword(password), status: "ACTIVE", platformRole: "USER" });
  await createAuthSession(event, user._id);
  setResponseStatus(event, 201);
  setResponseHeader(event, "cache-control", "no-store");
  return { authenticated: true };
});
