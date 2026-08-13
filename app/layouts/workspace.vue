<script setup lang="ts">
const route = useRoute();
const { locale, t } = useLocale();
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
const navItems = computed(() => ({
  superAdmin: [
    { label: t("common.overview"), to: "/super-admin", icon: "i-lucide-layout-dashboard" },
    { label: t("common.companyReviews"), to: "/super-admin/companies", icon: "i-lucide-building-2" },
  ],
  companyAdmin: [
    { label: t("common.overview"), to: "/company-admin", icon: "i-lucide-layout-dashboard" },
    { label: t("common.requests"), to: "/company-admin/requests", icon: "i-lucide-inbox" },
    { label: t("common.orders"), to: "/company-admin/orders", icon: "i-lucide-clipboard-list" },
    { label: t("common.schedule"), to: "/company-admin/schedule", icon: "i-lucide-calendar-days" },
    { label: t("common.customers"), to: "/company-admin/customers", icon: "i-lucide-users" },
    { label: t("common.services"), to: "/company-admin/services", icon: "i-lucide-briefcase-business" },
    { label: t("common.company"), to: "/company-admin/company", icon: "i-lucide-building" },
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
    ...(auth.session.value.user?.platformRole === "SUPER_ADMIN" ? [] : [{ label: t("common.createCompany"), to: "/register/company", icon: "i-lucide-building-2" }]),
  ],
}[workspace.value]));

const workspaceRoot = computed(() => ({ superAdmin: "/super-admin", companyAdmin: "/company-admin", employee: "/employee", customer: "/customer" }[workspace.value]));
const isActive = (to: string) => route.path === to || (to !== workspaceRoot.value && route.path.startsWith(`${to}/`));
const accountRole = computed(() => {
  if (workspace.value === "superAdmin") return t("roles.SUPER_ADMIN");
  if (auth.session.value.membership?.role) return t(`roles.${auth.session.value.membership.role}`);
  return t("workspaces.personal.title");
});
const userInitial = computed(() => auth.session.value.user?.name?.trim().charAt(0).toUpperCase() || "D");
const drawerSide = computed(() => locale.value === "ar" ? "right" : "left");

watch(() => route.path, () => { mobileOpen.value = false; });
</script>

<template>
  <div class="min-h-screen bg-[var(--drixal-bg)] text-[var(--drixal-ink)]">
    <header class="fixed inset-x-0 top-0 z-40 flex h-12 items-center border-b border-[#393939] bg-[#161616] text-white">
      <NuxtLink :to="workspaceRoot" class="workspace-brand flex h-full w-56 shrink-0 items-center border-e border-[#393939] px-4 max-lg:w-auto max-lg:border-e-0">
        <DrixalBrand inverse />
      </NuxtLink>
      <div class="flex min-w-0 flex-1 items-center justify-between">
         <div class="flex min-w-0 items-center">
           <UButton icon="i-lucide-menu" color="neutral" variant="ghost" class="mx-1 text-white lg:hidden" :aria-label="t('shell.openNavigation')" @click="mobileOpen = true" />
           <span class="max-w-36 truncate text-xs font-semibold lg:hidden">{{ auth.session.value.company?.name || workspaceTitle }}</span>
           <div class="hidden min-w-0 px-4 lg:block">
            <span class="truncate text-sm font-semibold">{{ workspaceTitle }}</span>
            <span class="mx-2 text-[#6f6f6f]">/</span>
            <span class="truncate text-xs text-[#c6c6c6]">{{ auth.session.value.company?.name || auth.session.value.user?.name }}</span>
          </div>
        </div>
        <div class="flex h-full items-center">
          <AppPreferences class="me-1 hidden sm:flex" />
          <div class="hidden h-full items-center gap-3 border-s border-[#393939] px-4 sm:flex">
            <span class="grid size-7 place-items-center bg-[var(--color-brand)] text-xs font-bold text-white">{{ userInitial }}</span>
            <span class="max-w-36 truncate text-xs font-semibold">{{ auth.session.value.user?.name }}</span>
          </div>
        </div>
      </div>
    </header>

    <aside class="fixed inset-y-0 start-0 z-30 hidden w-56 border-e border-[var(--drixal-line)] bg-[var(--drixal-surface)] pt-12 lg:flex lg:flex-col">
      <div class="border-b border-[var(--drixal-line)] px-4 py-5">
        <p class="text-xs font-semibold text-[var(--drixal-muted)]">{{ t("shell.workspace") }}</p>
        <WorkspaceSwitcher class="mt-2" />
      </div>
      <nav class="grid py-2" :aria-label="workspaceTitle">
        <NuxtLink v-for="item in navItems" :key="item.to" :to="item.to" class="relative flex min-h-10 items-center gap-3 px-4 text-sm font-semibold transition-colors" :class="isActive(item.to) ? 'bg-[var(--drixal-soft-strong)] text-[var(--drixal-blue)] before:absolute before:inset-y-0 before:start-0 before:w-0.5 before:bg-[var(--color-brand)]' : 'text-[var(--drixal-muted)] hover:bg-[var(--drixal-hover)] hover:text-[var(--drixal-ink)]'">
          <UIcon :name="item.icon" class="size-4 shrink-0" />
          <span>{{ item.label }}</span>
        </NuxtLink>
      </nav>
      <div class="mt-auto border-t border-[var(--drixal-line)]">
        <div class="px-4 py-4 text-xs">
          <p class="truncate font-bold">{{ auth.session.value.user?.name }}</p>
          <p class="mt-1 truncate text-[var(--drixal-muted)]">{{ accountRole }}</p>
        </div>
        <UButton :label="t('common.logout')" icon="i-lucide-log-out" color="neutral" variant="ghost" block class="justify-start rounded-none border-t border-[var(--drixal-line)]" @click="auth.logout" />
      </div>
    </aside>

    <main class="min-w-0 pt-12 lg:ps-56">
      <div class="mx-auto max-w-[1600px] p-4 sm:p-6 lg:p-8">
        <slot />
      </div>
    </main>

    <USlideover
      v-model:open="mobileOpen"
      :title="t('shell.navigation')"
      :description="workspaceTitle"
      :side="drawerSide"
      class="lg:hidden"
      :ui="{ content: 'max-w-80', body: 'flex flex-col p-0 sm:p-0' }"
    >
      <template #body>
        <div class="border-b border-[var(--drixal-line)] p-4">
          <p class="text-xs font-semibold text-[var(--drixal-muted)]">{{ t("shell.currentWorkspace") }}</p>
          <WorkspaceSwitcher class="mt-2" />
        </div>
        <nav class="grid py-2" :aria-label="workspaceTitle">
          <NuxtLink v-for="item in navItems" :key="item.to" :to="item.to" class="relative flex min-h-11 items-center gap-3 px-4 text-sm font-semibold" :class="isActive(item.to) ? 'bg-[var(--drixal-soft-strong)] text-[var(--drixal-blue)] before:absolute before:inset-y-0 before:start-0 before:w-0.5 before:bg-[var(--color-brand)]' : 'text-[var(--drixal-muted)] hover:bg-[var(--drixal-hover)] hover:text-[var(--drixal-ink)]'">
            <UIcon :name="item.icon" class="size-4 shrink-0" />
            <span>{{ item.label }}</span>
          </NuxtLink>
        </nav>
        <div class="mt-auto border-t border-[var(--drixal-line)] p-4 text-xs">
          <p class="truncate font-bold">{{ auth.session.value.user?.name }}</p>
          <p class="mt-1 truncate text-[var(--drixal-muted)]">{{ accountRole }}</p>
          <AppPreferences class="mt-4" />
          <UButton class="mt-3 justify-start" :label="t('common.logout')" icon="i-lucide-log-out" color="neutral" variant="ghost" block @click="auth.logout" />
        </div>
      </template>
    </USlideover>
  </div>
</template>
