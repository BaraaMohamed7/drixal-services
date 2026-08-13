import { assertSameOrigin, createAuthSession, verifyPassword } from "../../utils/auth";
import { User } from "../../models/user.schema";

export default defineEventHandler(async (event) => {
  assertSameOrigin(event);
  const body = await readBody<{ email?: unknown; password?: unknown }>(event);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";
  const user = email ? await User.findOne({ email, status: "ACTIVE" }).select("+passwordHash") : null;
  const valid = user?.passwordHash ? await verifyPassword(password, user.passwordHash) : false;

  if (!user || !valid) throw createError({ statusCode: 401, statusMessage: "Invalid email or password" });
  await createAuthSession(event, user._id);
  setResponseHeader(event, "cache-control", "no-store");
  return { authenticated: true };
});
