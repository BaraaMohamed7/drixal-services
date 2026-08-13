const companyAdminRoles = ["OWNER", "ADMIN", "MANAGER"];
const employeeRoles = ["TECHNICIAN", "VIEWER"];

const legacyDestination = (path: string, companyAdmin: boolean) => {
  if (path === "/admin/companies") return "/super-admin/companies";
  if (!path.startsWith("/provider")) return undefined;

  if (companyAdmin) return path.replace(/^\/provider/, "/company-admin");
  if (path.startsWith("/provider/orders")) return path.replace(/^\/provider/, "/employee");
  if (path.startsWith("/provider/schedule")) return path.replace(/^\/provider/, "/employee");
  return "/employee";
};

export default defineNuxtRouteMiddleware(async (to) => {
  const auth = useAuth();
  await auth.load(true);
  const session = auth.session.value;
  const isAuthPage = to.path.startsWith("/auth/");
  const isProtected = ["/super-admin", "/company-admin", "/employee", "/customer", "/register/company", "/admin", "/provider"].some(
    (prefix) => to.path === prefix || to.path.startsWith(`${prefix}/`),
  );

  if (isAuthPage && session.authenticated) return navigateTo(auth.workspaceHome.value);
  if (isProtected && !session.authenticated) return navigateTo({ path: "/auth/login", query: { next: to.fullPath } });
  if (!session.authenticated) return;

  const role = session.membership?.role || "";
  const isCompanyAdmin = companyAdminRoles.includes(role);
  const isEmployee = employeeRoles.includes(role);
  const legacy = legacyDestination(to.path, isCompanyAdmin);
  if (legacy) return navigateTo({ path: legacy, query: to.query }, { redirectCode: 302 });

  if (to.path.startsWith("/super-admin") && session.user?.platformRole !== "SUPER_ADMIN") return navigateTo(auth.workspaceHome.value);
  if (to.path.startsWith("/company-admin") && !isCompanyAdmin) return navigateTo(auth.workspaceHome.value);
  if (to.path.startsWith("/employee") && !isEmployee) return navigateTo(auth.workspaceHome.value);
  if (to.path.startsWith("/customer") && (session.user?.platformRole === "SUPER_ADMIN" || session.membership)) return navigateTo(auth.workspaceHome.value);
  if (to.path === "/register/company" && (session.membership || session.user?.platformRole === "SUPER_ADMIN")) return navigateTo(auth.workspaceHome.value);
});
