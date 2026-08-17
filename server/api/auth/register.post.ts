import { assertSameOrigin, createAuthSession, hashPassword } from "../../utils/auth";
import { User } from "../../models/user.schema";
import { enforceRateLimit } from "../../utils/rate-limit";

export default defineEventHandler(async (event) => {
  assertSameOrigin(event);
  enforceRateLimit(event, "auth-register", 5, 60 * 60 * 1000);
  const body = await readBody<{ name?: unknown; email?: unknown; password?: unknown }>(event);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!name || name.length > 120) throw createError({ statusCode: 400, statusMessage: "Name is required" });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw createError({ statusCode: 400, statusMessage: "A valid email is required" });
  if (await User.exists({ email })) throw createError({ statusCode: 409, statusMessage: "An account already exists for this email" });

  let user;
  try {
    user = await User.create({ name, email, passwordHash: await hashPassword(password), status: "ACTIVE", type: "CUSTOMER", platformRole: "USER" });
    await createAuthSession(event, user._id);
    setResponseStatus(event, 201);
    setResponseHeader(event, "cache-control", "no-store");
    return { authenticated: true };
  } catch (error) {
    if (user?._id) await User.deleteOne({ _id: user._id });
    if (typeof error === "object" && error !== null && "code" in error && (error as { code?: number }).code === 11000) {
      throw createError({ statusCode: 409, statusMessage: "An account already exists for this email" });
    }
    throw error;
  }
});
