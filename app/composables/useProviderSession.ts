export type ProviderPermission =
  | "company.read"
  | "services.read"
  | "services.manage"
  | "services.publish"
  | "requests.read"
  | "requests.decide"
  | "requests.convert"
  | "customers.read"
  | "customers.manage"
  | "orders.read"
  | "orders.manage"
  | "companies.review";

type ProviderSession = {
  demo: boolean;
  user: { name: string; email: string; platformRole: "USER" | "SUPER_ADMIN" } | null;
  company: { name: string; slug: string; status: "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED" } | null;
  membership: { role: "OWNER" | "ADMIN" | "MANAGER" | "TECHNICIAN" | "VIEWER" } | null;
  permissions: ProviderPermission[];
};

export const useProviderSession = () => {
  const sessionRequest = useFetch<ProviderSession>("/api/session", { key: "provider-session" });
  const hasPermission = (permission: ProviderPermission) => Boolean(sessionRequest.data.value?.permissions.includes(permission));
  const providerHome = computed(() => {
    if (hasPermission("companies.review")) return "/admin/companies";
    if (hasPermission("services.read")) return "/provider/services";
    if (hasPermission("requests.read")) return "/provider/requests";
    if (hasPermission("orders.read")) return "/provider/orders";
    if (hasPermission("customers.read")) return "/provider/customers";
    if (hasPermission("company.read")) return "/provider/company";
    return "/marketplace";
  });

  return {
    ...sessionRequest,
    hasPermission,
    providerHome,
  };
};
