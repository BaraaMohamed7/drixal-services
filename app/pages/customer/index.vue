<script setup lang="ts">
definePageMeta({ layout: "workspace" });
type RequestItem = { status: string };
type OrderItem = { _id: string; orderNumber: string; title: string; status: string; scheduledDate?: string; companyId?: { name?: string }; serviceId?: { name?: string } };
const { locale, t } = useLocale();
const auth = useAuth();
const openingCompanyId = ref("");
const [{ data: requests }, { data: orders }] = await Promise.all([
  useFetch<{ items: RequestItem[] }>("/api/customer/requests"),
  useFetch<{ items: OrderItem[] }>("/api/customer/orders"),
]);
const requestItems = computed(() => requests.value?.items || []);
const orderItems = computed(() => orders.value?.items || []);
const memberships = computed(() => auth.session.value.memberships.filter((membership) => membership.company));
const activeOrders = computed(() => orderItems.value.filter((item) => !["COMPLETED", "CANCELLED"].includes(item.status)));
const nextOrder = computed(() => [...activeOrders.value].sort((a, b) => {
  if (!a.scheduledDate) return 1;
  if (!b.scheduledDate) return -1;
  return new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime();
})[0]);
const metrics = computed(() => [
  { label: t("common.requests"), value: requestItems.value.length, to: "/customer/requests" },
  { label: t("common.orders"), value: orderItems.value.length, to: "/customer/orders" },
  { label: t("dashboards.activeOrders"), value: activeOrders.value.length, to: "/customer/orders" },
]);
const journey = computed(() => ["NEW", "UNDER_REVIEW", "APPROVED", "CONVERTED"].map((status) => ({ status, label: t(`statuses.${status}`), value: requestItems.value.filter((item) => item.status === status).length })));
const journeyMax = computed(() => Math.max(1, ...journey.value.map((item) => item.value)));
const formatDate = (value?: string) => value ? new Intl.DateTimeFormat(locale.value === "ar" ? "ar-EG" : "en-GB", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value)) : "-";
const companyError = ref("");
const openCompany = async (companyId: string) => {
  openingCompanyId.value = companyId;
  companyError.value = "";
  try {
    await auth.switchWorkspace({ type: "COMPANY", companyId });
    await navigateTo(auth.workspaceHome.value);
  } catch (err) {
    companyError.value = err instanceof Error ? err.message : t("shell.workspaceSwitchError");
  } finally {
    openingCompanyId.value = "";
  }
};
</script>

<template>
  <section class="page-stack">
    <header class="page-header">
      <div><p class="mb-2 text-xs font-semibold text-[var(--drixal-blue)]">{{ auth.session.value.user?.name }}</p><h1 class="page-title">{{ t("dashboards.customer.title") }}</h1><p class="page-description">{{ t("dashboards.customer.description") }}</p></div>
      <div class="flex flex-wrap gap-2">
        <UButton v-if="auth.session.value.user?.platformRole !== 'SUPER_ADMIN'" to="/register/company" :label="t('common.createCompany')" color="neutral" variant="outline" icon="i-lucide-building-2" />
        <UButton to="/marketplace" :label="t('dashboards.findServiceAction')" icon="i-lucide-store" />
      </div>
    </header>
    <section v-if="nextOrder" class="operation-panel">
      <div class="grid items-center gap-4 p-5 sm:grid-cols-[minmax(0,1fr)_auto]">
        <div class="min-w-0">
          <p class="text-xs font-semibold text-[var(--drixal-muted)]">{{ t("dashboards.nextService") }}</p>
          <div class="mt-2 flex flex-wrap items-center gap-2">
            <h2 class="truncate text-lg font-semibold">{{ nextOrder.title }}</h2>
            <UBadge :label="t(`statuses.${nextOrder.status}`)" :color="statusColor(nextOrder.status)" variant="soft" />
          </div>
          <p class="mt-1 text-sm text-[var(--drixal-muted)]">{{ nextOrder.companyId?.name || "-" }}<template v-if="nextOrder.scheduledDate"> · {{ formatDate(nextOrder.scheduledDate) }}</template></p>
        </div>
        <UButton :to="`/customer/orders/${nextOrder._id}`" :label="t('dashboards.openOrder')" color="neutral" variant="outline" icon="i-lucide-arrow-right" />
      </div>
    </section>
    <div class="metric-grid xl:grid-cols-3">
      <NuxtLink v-for="metric in metrics" :key="metric.label" :to="metric.to" class="metric-tile"><p class="metric-label">{{ metric.label }}</p><p class="metric-value">{{ metric.value }}</p><span class="metric-action">{{ t("common.viewAll") }}</span></NuxtLink>
    </div>
    <div class="dashboard-grid">
      <section class="operation-panel">
        <div class="panel-header"><h2 class="panel-title">{{ t("dashboards.recentOrders") }}</h2><NuxtLink to="/customer/orders" class="panel-link">{{ t("common.viewAll") }}</NuxtLink></div>
        <div v-if="orderItems.length" class="table-scroll border-0"><table class="business-table"><thead><tr><th>{{ t("common.order") }}</th><th>{{ t("common.provider") }}</th><th>{{ t("common.service") }}</th><th>{{ t("common.status") }}</th><th>{{ t("common.scheduledDate") }}</th></tr></thead><tbody><tr v-for="order in orderItems.slice(0, 6)" :key="order._id"><td><NuxtLink :to="`/customer/orders/${order._id}`" class="font-bold text-[var(--drixal-blue)]">{{ order.orderNumber }}</NuxtLink><div class="mt-1 max-w-52 truncate text-xs text-[var(--drixal-muted)]">{{ order.title }}</div></td><td>{{ order.companyId?.name || "-" }}</td><td>{{ order.serviceId?.name || "-" }}</td><td><UBadge :label="t(`statuses.${order.status}`)" :color="statusColor(order.status)" variant="soft" /></td><td>{{ formatDate(order.scheduledDate) }}</td></tr></tbody></table></div>
        <div v-else class="p-6"><p class="font-semibold">{{ t("customerPortal.noOrders") }}</p><p class="mt-1 text-sm text-[var(--drixal-muted)]">{{ t("customerPortal.noOrdersDescription") }}</p></div>
      </section>
      <section class="operation-panel"><div class="panel-header"><h2 class="panel-title">{{ t("dashboards.requestJourney") }}</h2><NuxtLink to="/customer/requests" class="panel-link">{{ t("common.viewAll") }}</NuxtLink></div><div class="pipeline-list"><div v-for="item in journey" :key="item.status" class="pipeline-item"><span class="pipeline-label">{{ item.label }}</span><span class="pipeline-value">{{ item.value }}</span><div class="pipeline-track"><div class="pipeline-fill" :style="{ width: `${(item.value / journeyMax) * 100}%` }" /></div></div></div></section>
    </div>
    <section v-if="auth.session.value.user?.platformRole !== 'SUPER_ADMIN'" class="operation-panel">
      <div class="panel-header">
        <div><h2 class="panel-title">{{ t("dashboards.myCompanies") }}</h2><p class="mt-1 text-xs text-[var(--drixal-muted)]">{{ t("dashboards.myCompaniesDescription") }}</p></div>
        <UButton to="/register/company" :label="t('common.createCompany')" color="neutral" variant="outline" size="sm" />
      </div>
      <p v-if="companyError" class="drixal-danger m-4 p-3 text-sm font-semibold" role="alert">{{ companyError }}</p>
      <div v-if="memberships.length" class="divide-y divide-[var(--drixal-line)]">
        <div v-for="membership in memberships" :key="membership.id" class="flex flex-col items-start justify-between gap-3 p-4 sm:flex-row sm:items-center">
          <div class="min-w-0">
            <p class="truncate font-semibold">{{ membership.company?.name }}</p>
            <div class="mt-1 flex flex-wrap items-center gap-2 text-xs text-[var(--drixal-muted)]">
              <span>{{ t(`roles.${membership.role}`) }}</span>
              <UBadge v-if="membership.company" :label="t(`statuses.${membership.company.status}`)" :color="statusColor(membership.company.status)" variant="soft" size="sm" />
            </div>
          </div>
          <UButton v-if="membership.company" :label="t('dashboards.openCompany')" color="neutral" variant="outline" size="sm" :loading="openingCompanyId === membership.company.id" :disabled="Boolean(openingCompanyId)" @click="openCompany(membership.company.id)" />
        </div>
      </div>
      <div v-else class="p-5">
        <p class="text-sm font-semibold">{{ t("dashboards.noCompanies") }}</p>
        <p class="mt-1 text-sm text-[var(--drixal-muted)]">{{ t("dashboards.noCompaniesDescription") }}</p>
      </div>
    </section>
  </section>
</template>
