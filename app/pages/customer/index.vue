<script setup lang="ts">
definePageMeta({ layout: "workspace" });
type RequestItem = { status: string };
type OrderItem = { _id: string; orderNumber: string; title: string; status: string; scheduledDate?: string; companyId?: { name?: string }; serviceId?: { name?: string } };
const { locale, t } = useLocale();
const [{ data: requests }, { data: orders }] = await Promise.all([
  useFetch<{ items: RequestItem[] }>("/api/customer/requests"),
  useFetch<{ items: OrderItem[] }>("/api/customer/orders"),
]);
const requestItems = computed(() => requests.value?.items || []);
const orderItems = computed(() => orders.value?.items || []);
const activeOrders = computed(() => orderItems.value.filter((item) => !["COMPLETED", "CANCELLED"].includes(item.status)));
const metrics = computed(() => [
  { label: t("common.requests"), value: requestItems.value.length, to: "/customer/requests" },
  { label: t("common.orders"), value: orderItems.value.length, to: "/customer/orders" },
  { label: t("dashboards.activeOrders"), value: activeOrders.value.length, to: "/customer/orders" },
]);
const journey = computed(() => ["NEW", "UNDER_REVIEW", "APPROVED", "CONVERTED"].map((status) => ({ status, label: t(`statuses.${status}`), value: requestItems.value.filter((item) => item.status === status).length })));
const journeyMax = computed(() => Math.max(1, ...journey.value.map((item) => item.value)));
const formatDate = (value?: string) => value ? new Intl.DateTimeFormat(locale.value === "ar" ? "ar-EG" : "en-GB", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value)) : "-";
</script>

<template>
  <section class="page-stack">
    <header class="page-header">
      <div><h1 class="page-title">{{ t("dashboards.customer.title") }}</h1><p class="page-description">{{ t("dashboards.customer.description") }}</p></div>
      <UButton to="/marketplace" :label="t('common.marketplace')" icon="i-lucide-store" />
    </header>
    <div class="metric-grid xl:grid-cols-3">
      <NuxtLink v-for="metric in metrics" :key="metric.label" :to="metric.to" class="metric-tile"><p class="metric-label">{{ metric.label }}</p><p class="metric-value">{{ metric.value }}</p><span class="metric-action">{{ t("common.viewAll") }}</span></NuxtLink>
    </div>
    <div class="dashboard-grid">
      <section class="operation-panel">
        <div class="panel-header"><h2 class="panel-title">{{ t("dashboards.recentOrders") }}</h2><NuxtLink to="/customer/orders" class="panel-link">{{ t("common.viewAll") }}</NuxtLink></div>
        <div v-if="orderItems.length" class="table-scroll border-0"><table class="business-table"><thead><tr><th>{{ t("common.order") }}</th><th>{{ t("common.provider") }}</th><th>{{ t("common.service") }}</th><th>{{ t("common.status") }}</th><th>{{ t("common.scheduledDate") }}</th></tr></thead><tbody><tr v-for="order in orderItems.slice(0, 6)" :key="order._id"><td><NuxtLink :to="`/customer/orders/${order._id}`" class="font-bold text-[var(--drixal-blue)]">{{ order.orderNumber }}</NuxtLink><div class="mt-1 max-w-52 truncate text-xs text-[var(--drixal-muted)]">{{ order.title }}</div></td><td>{{ order.companyId?.name || "-" }}</td><td>{{ order.serviceId?.name || "-" }}</td><td><UBadge :label="t(`statuses.${order.status}`)" variant="soft" /></td><td>{{ formatDate(order.scheduledDate) }}</td></tr></tbody></table></div>
        <div v-else class="p-6"><p class="font-semibold">{{ t("customerPortal.noOrders") }}</p><p class="mt-1 text-sm text-[var(--drixal-muted)]">{{ t("customerPortal.noOrdersDescription") }}</p></div>
      </section>
      <section class="operation-panel"><div class="panel-header"><h2 class="panel-title">{{ t("dashboards.requestJourney") }}</h2><NuxtLink to="/customer/requests" class="panel-link">{{ t("common.viewAll") }}</NuxtLink></div><div class="pipeline-list"><div v-for="item in journey" :key="item.status" class="pipeline-item"><span class="pipeline-label">{{ item.label }}</span><span class="pipeline-value">{{ item.value }}</span><div class="pipeline-track"><div class="pipeline-fill" :style="{ width: `${(item.value / journeyMax) * 100}%` }" /></div></div></div></section>
    </div>
  </section>
</template>
