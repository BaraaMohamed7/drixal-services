const legacyDestination = (path: string, session: ReturnType<typeof useAuth>["session"]["value"]) => {
  if (path === "/admin/companies") return "/super-admin/companies";
  if (!path.startsWith("/provider")) return undefined;

  if (session.isOwner || session.permissions.includes("services.create")) return path.replace(/^\/provider/, "/company-admin");
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

  const legacy = legacyDestination(to.path, session);
  if (legacy) return navigateTo({ path: legacy, query: to.query }, { redirectCode: 302 });

  if (to.path.startsWith("/super-admin") && (session.user?.type !== "SUPER_ADMIN" || session.tenant?.kind !== "PLATFORM")) return navigateTo(auth.workspaceHome.value);
  if (to.path.startsWith("/company-admin") && !(session.isOwner || session.permissions.includes("services.create"))) return navigateTo(auth.workspaceHome.value);
  if (to.path.startsWith("/employee") && (session.isOwner || session.permissions.includes("services.create"))) return navigateTo(auth.workspaceHome.value);
  if (to.path.startsWith("/customer") && session.tenant?.kind !== "PLATFORM") return navigateTo(auth.workspaceHome.value);
  if (to.path === "/register/company" && session.user?.type === "SUPER_ADMIN") return navigateTo(auth.workspaceHome.value);
});
