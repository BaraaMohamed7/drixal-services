import { getAuthContext, toSessionDto } from "../../utils/auth";

export default defineEventHandler(async (event) => {
  setResponseHeader(event, "cache-control", "no-store");
  return toSessionDto(await getAuthContext(event));
});
