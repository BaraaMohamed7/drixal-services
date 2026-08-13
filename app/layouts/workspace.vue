<script setup lang="ts">
const route = useRoute();
const { t } = useLocale();
const auth = useAuth();
await auth.load();
const mobileOpen = ref(false);

const workspace = computed(() => {
  if (route.path.startsWith("/super-admin")) return "superAdmin";
  if (route.path.startsWith("/company-admin")) return "companyAdmin";
  if (route.path.startsWith("/employee")) return "employee";
  return "customer";
});

const workspaceTitle = computed(() => t(`workspaces.${workspace.value}.title`));
const workspaceDescription = computed(() => t(`workspaces.${workspace.value}.description`));
const navItems = computed(() => ({
  superAdmin: [
    { label: t("common.overview"), to: "/super-admin", icon: "i-lucide-layout-dashboard" },
    { label: t("common.companyReviews"), to: "/super-admin/companies", icon: "i-lucide-building-2" },
  ],
  companyAdmin: [
    { label: t("common.overview"), to: "/company-admin", icon: "i-lucide-layout-dashboard" },
    { label: t("common.company"), to: "/company-admin/company", icon: "i-lucide-building" },
    { label: t("common.services"), to: "/company-admin/services", icon: "i-lucide-briefcase-business" },
    { label: t("common.requests"), to: "/company-admin/requests", icon: "i-lucide-inbox" },
    { label: t("common.customers"), to: "/company-admin/customers", icon: "i-lucide-users" },
    { label: t("common.orders"), to: "/company-admin/orders", icon: "i-lucide-clipboard-list" },
    { label: t("common.schedule"), to: "/company-admin/schedule", icon: "i-lucide-calendar-days" },
  ],
  employee: [
    { label: t("common.overview"), to: "/employee", icon: "i-lucide-layout-dashboard" },
    { label: t("common.orders"), to: "/employee/orders", icon: "i-lucide-clipboard-check" },
    { label: t("common.schedule"), to: "/employee/schedule", icon: "i-lucide-calendar-clock" },
  ],
  customer: [
    { label: t("common.overview"), to: "/customer", icon: "i-lucide-layout-dashboard" },
    { label: t("common.requests"), to: "/customer/requests", icon: "i-lucide-messages-square" },
    { label: t("common.orders"), to: "/customer/orders", icon: "i-lucide-receipt-text" },
    { label: t("common.marketplace"), to: "/marketplace", icon: "i-lucide-store" },
  ],
}[workspace.value]));

const workspaceRoot = computed(() => ({ superAdmin: "/super-admin", companyAdmin: "/company-admin", employee: "/employee", customer: "/customer" }[workspace.value]));
const isActive = (to: string) => route.path === to || (to !== workspaceRoot.value && route.path.startsWith(`${to}/`));
const accountRole = computed(() => {
  if (auth.session.value.user?.platformRole === "SUPER_ADMIN") return t("roles.SUPER_ADMIN");
  if (auth.session.value.membership?.role) return t(`roles.${auth.session.value.membership.role}`);
  return t("roles.CUSTOMER");
});
</script>

<template>
  <div class="min-h-screen bg-[var(--drixal-bg)] text-[var(--drixal-ink)]">
    <div class="mx-auto grid min-h-screen max-w-[1600px] lg:grid-cols-[260px_minmax(0,1fr)]">
      <aside class="hidden border-e border-[var(--drixal-line)] bg-[var(--drixal-surface)] p-4 lg:flex lg:flex-col">
        <NuxtLink :to="navItems[0]?.to || '/'" class="flex items-center gap-3 px-2 py-2">
          <span class="grid size-10 place-items-center rounded-lg bg-[var(--color-brand)] text-xs font-black text-white">{{ t("shell.brandMark") }}</span>
          <span class="min-w-0"><span class="block truncate font-black">{{ t("common.appName") }}</span><span class="drixal-muted block truncate text-xs">{{ workspaceTitle }}</span></span>
        </NuxtLink>
        <div class="mt-6 rounded-lg border border-[var(--drixal-line)] bg-[var(--drixal-soft)] p-3">
          <p class="text-xs font-black uppercase tracking-[0.12em] text-[var(--drixal-blue)]">{{ workspaceTitle }}</p>
          <p class="drixal-muted mt-1 text-xs leading-5">{{ workspaceDescription }}</p>
        </div>
        <nav class="mt-5 grid gap-1">
          <NuxtLink v-for="item in navItems" :key="item.to" :to="item.to" class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition" :class="isActive(item.to) ? 'bg-[var(--drixal-soft-strong)] text-[var(--drixal-blue)]' : 'drixal-muted hover:bg-[var(--drixal-hover)] hover:text-[var(--drixal-ink)]'">
            <UIcon :name="item.icon" class="size-4" /><span>{{ item.label }}</span>
          </NuxtLink>
        </nav>
        <div class="mt-auto border-t border-[var(--drixal-line)] pt-4">
          <div class="mb-3 px-2 text-sm"><p class="truncate font-bold">{{ auth.session.value.user?.name }}</p><p class="drixal-muted mt-0.5 truncate text-xs">{{ auth.session.value.company?.name || accountRole }}</p><p class="mt-1 text-xs font-bold text-[var(--drixal-blue)]">{{ accountRole }}</p></div>
          <UButton :label="t('common.logout')" icon="i-lucide-log-out" color="neutral" variant="ghost" block @click="auth.logout" />
        </div>
      </aside>

      <div class="min-w-0">
        <header class="sticky top-0 z-30 border-b border-[var(--drixal-line)] bg-[var(--drixal-surface)] px-4 py-3 sm:px-6 lg:px-8">
          <div class="flex items-center justify-between gap-3">
            <div class="flex min-w-0 items-center gap-3"><UButton icon="i-lucide-menu" color="neutral" variant="ghost" class="lg:hidden" :aria-label="t('shell.openNavigation')" @click="mobileOpen = true" /><div class="min-w-0"><p class="truncate text-sm font-bold">{{ workspaceTitle }}</p><p class="drixal-muted hidden truncate text-xs sm:block">{{ auth.session.value.company?.name || auth.session.value.user?.name }}</p></div></div>
            <AppPreferences />
          </div>
        </header>
        <main class="min-w-0 px-4 py-5 sm:px-6 lg:px-8"><slot /></main>
      </div>
    </div>

    <div v-if="mobileOpen" class="fixed inset-0 z-50 lg:hidden">
      <button class="absolute inset-0 bg-black/45" :aria-label="t('common.close')" @click="mobileOpen = false" />
      <aside class="absolute inset-y-0 start-0 flex w-[min(320px,88vw)] flex-col border-e border-[var(--drixal-line)] bg-[var(--drixal-surface)] p-4">
        <div class="flex items-center justify-between"><span class="font-black">{{ workspaceTitle }}</span><UButton icon="i-lucide-x" color="neutral" variant="ghost" :aria-label="t('common.close')" @click="mobileOpen = false" /></div>
        <nav class="mt-5 grid gap-1"><NuxtLink v-for="item in navItems" :key="item.to" :to="item.to" class="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold" :class="isActive(item.to) ? 'bg-[var(--drixal-soft-strong)] text-[var(--drixal-blue)]' : 'drixal-muted'" @click="mobileOpen = false"><UIcon :name="item.icon" class="size-4" />{{ item.label }}</NuxtLink></nav>
        <UButton class="mt-auto" :label="t('common.logout')" icon="i-lucide-log-out" color="neutral" variant="outline" block @click="auth.logout" />
      </aside>
    </div>
  </div>
</template>
