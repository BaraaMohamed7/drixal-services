import { assertSameOrigin, revokeAuthSession } from "../../utils/auth";

export default defineEventHandler(async (event) => {
  assertSameOrigin(event);
  await revokeAuthSession(event);
  setResponseHeader(event, "cache-control", "no-store");
  return { authenticated: false };
});
