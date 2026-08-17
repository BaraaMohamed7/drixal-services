export type AppUserType = "CUSTOMER" | "COMPANY_USER" | "SUPER_ADMIN";

export type AppPermission =
  | "members.read"
  | "members.create"
  | "members.update"
  | "members.deactivate"
  | "members.assign_role"
  | "roles.read"
  | "roles.create"
  | "roles.update"
  | "roles.delete"
  | "roles.manage_permissions"
  | "services.read"
  | "services.create"
  | "services.update"
  | "services.delete"
  | "services.publish"
  | "requests.read"
  | "requests.assign"
  | "requests.update_status"
  | "requests.convert"
  | "customers.read"
  | "customers.create"
  | "customers.update"
  | "orders.read"
  | "orders.create"
  | "orders.update"
  | "orders.manage"
  | "company_settings.read"
  | "company_settings.update"
  | "domains.read"
  | "domains.create"
  | "domains.update"
  | "domains.delete"
  | "companies.review";

type CompanySummary = {
  id: string;
  name: string;
  slug: string;
  status: "SETUP" | "ACTIVE" | "SUSPENDED";
};

export type AuthSession = {
  authenticated: boolean;
  user: { id: string; name: string; email: string; type: AppUserType; platformRole: "USER" | "SUPER_ADMIN" } | null;
  tenant: { kind: "PLATFORM" | "COMPANY"; domain: string } | null;
  company: CompanySummary | null;
  membership: { id: string; roleId: string | null; status: "ACTIVE" | "INACTIVE" } | null;
  isOwner: boolean;
  memberships: { id: string; roleId: string | null; status: string; role: string; company: CompanySummary }[];
  permissions: AppPermission[];
};

const emptySession = (): AuthSession => ({
  authenticated: false,
  user: null,
  tenant: null,
  company: null,
  membership: null,
  isOwner: false,
  memberships: [],
  permissions: [],
});

export const useAuth = () => {
  const session = useState<AuthSession>("auth-session", emptySession);
  const loaded = useState("auth-session-loaded", () => false);
  const requestFetch = useRequestFetch();

  const load = async (force = false) => {
    if (loaded.value && !force) return session.value;
    session.value = await requestFetch<AuthSession>("/api/auth/session");
    loaded.value = true;
    return session.value;
  };

  const clear = () => {
    session.value = emptySession();
    loaded.value = true;
  };

  const hasPermission = (permission: AppPermission) => session.value.permissions.includes(permission);
  const isCompanyMember = computed(() => session.value.authenticated && session.value.tenant?.kind === "COMPANY");
  const isSuperAdmin = computed(() => session.value.user?.type === "SUPER_ADMIN");
  const workspaceHome = computed(() => {
    if (!session.value.authenticated) return "/auth/login";
    if (session.value.tenant?.kind === "PLATFORM" && session.value.isSuperAdmin) return "/super-admin";
    if (session.value.tenant?.kind === "COMPANY") {
      if (session.value.isOwner || session.value.permissions.includes("services.create")) return "/company-admin";
      return "/employee";
    }
    return "/customer";
  });

  const logout = async () => {
    await requestFetch("/api/auth/logout", { method: "POST" });
    clear();
    await navigateTo("/auth/login");
  };

  return { session, loaded, load, clear, hasPermission, isCompanyMember, isSuperAdmin, workspaceHome, logout };
};
