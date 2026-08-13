export type AppPermission =
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

export type CompanyRole = "OWNER" | "ADMIN" | "MANAGER" | "TECHNICIAN" | "VIEWER";

export type AuthSession = {
  authenticated: boolean;
  user: { id: string; name: string; email: string; platformRole: "USER" | "SUPER_ADMIN" } | null;
  company: { id: string; name: string; slug: string; status: "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED" } | null;
  membership: { id: string; role: CompanyRole; status: "ACTIVE" | "INACTIVE" } | null;
  memberships: Array<{
    id: string;
    role: CompanyRole;
    company: { id: string; name: string; slug: string; status: "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED" } | null;
  }>;
  permissions: AppPermission[];
};

const emptySession = (): AuthSession => ({
  authenticated: false,
  user: null,
  company: null,
  membership: null,
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
  const isCompanyAdmin = computed(() => ["OWNER", "ADMIN", "MANAGER"].includes(session.value.membership?.role || ""));
  const isEmployee = computed(() => ["TECHNICIAN", "VIEWER"].includes(session.value.membership?.role || ""));
  const workspaceHome = computed(() => {
    if (!session.value.authenticated) return "/auth/login";
    if (session.value.user?.platformRole === "SUPER_ADMIN") return "/super-admin";
    if (isCompanyAdmin.value) return "/company-admin";
    if (isEmployee.value) return "/employee";
    return "/customer";
  });

  const logout = async () => {
    await requestFetch("/api/auth/logout", { method: "POST" });
    clear();
    await navigateTo("/auth/login");
  };

  return { session, loaded, load, clear, hasPermission, isCompanyAdmin, isEmployee, workspaceHome, logout };
};
