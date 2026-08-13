import { assertSameOrigin, createAuthSession, verifyPassword } from "../../utils/auth";
import { User } from "../../models/user.schema";
import { enforceRateLimit } from "../../utils/rate-limit";

export default defineEventHandler(async (event) => {
  assertSameOrigin(event);
  enforceRateLimit(event, "auth-login", 10, 15 * 60 * 1000);
  const body = await readBody<{ email?: unknown; password?: unknown }>(event);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" && body.password.length <= 128 ? body.password : "";
  const user = email ? await User.findOne({ email, status: "ACTIVE" }).select("+passwordHash") : null;
  const valid = user?.passwordHash ? await verifyPassword(password, user.passwordHash) : false;

  if (!user || !valid) throw createError({ statusCode: 401, statusMessage: "Invalid email or password" });
  await createAuthSession(event, user._id);
  setResponseHeader(event, "cache-control", "no-store");
  return { authenticated: true };
});
