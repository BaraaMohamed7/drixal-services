import { resolveTenant } from "../utils/tenant";
import type { TenantContext } from "../utils/tenant";

declare module "h3" {
  interface H3EventContext {
    tenant?: TenantContext;
  }
}

export default defineEventHandler(async (event) => {
  event.context.tenant = await resolveTenant(event);
});
