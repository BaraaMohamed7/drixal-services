import type { ProviderPermission } from "~/composables/useProviderSession";

const permissionForRoute = (path: string): ProviderPermission | undefined => {
  if (path.startsWith("/admin/companies")) return "companies.review";
  if (path.startsWith("/provider/company")) return "company.read";
  if (path === "/provider/services/new" || /^\/provider\/services\/[^/]+\/edit$/.test(path)) return "services.manage";
  if (path.startsWith("/provider/services")) return "services.read";
  if (path.startsWith("/provider/requests")) return "requests.read";
  if (path.startsWith("/provider/orders") || path.startsWith("/provider/schedule")) return "orders.read";
  if (path.startsWith("/provider/customers")) return "customers.read";
};

export default defineNuxtRouteMiddleware(async (to) => {
  const permission = permissionForRoute(to.path);
  if (!permission) return;

  const { hasPermission, providerHome } = useProviderSession();
  await useFetch("/api/session", { key: "provider-session" });

  if (!hasPermission(permission)) return navigateTo(providerHome.value);
});
