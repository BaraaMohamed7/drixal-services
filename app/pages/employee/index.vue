<script setup lang="ts">
definePageMeta({ layout: "workspace" });
type OrderItem = { _id: string; orderNumber: string; title: string; status: "DRAFT" | "SCHEDULED" | "ASSIGNED" | "IN_PROGRESS" | "ON_HOLD" | "COMPLETED" | "CANCELLED"; priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"; scheduledDate?: string; customerId?: { name?: string }; serviceId?: { name?: string } };
const { locale, t } = useLocale();
const { data } = await useFetch<{ items: OrderItem[] }>("/api/service-orders");
const orders = computed(() => data.value?.items || []);
const active = computed(() => orders.value.filter((item) => !["COMPLETED", "CANCELLED"].includes(item.status)));
const scheduled = computed(() => active.value.filter((item) => item.scheduledDate));
const metrics = computed(() => [
  { label: t("dashboards.activeOrders"), value: active.value.length, to: "/employee/orders" },
  { label: t("dashboards.scheduledWork"), value: scheduled.value.length, to: "/employee/schedule" },
  { label: t("statuses.IN_PROGRESS"), value: active.value.filter((item) => item.status === "IN_PROGRESS").length, to: "/employee/orders?status=IN_PROGRESS" },
]);
const distribution = computed(() => ["ASSIGNED", "IN_PROGRESS", "ON_HOLD", "SCHEDULED"].map((status) => ({ status, label: t(`statuses.${status}`), value: active.value.filter((item) => item.status === status).length })));
const distributionMax = computed(() => Math.max(1, ...distribution.value.map((item) => item.value)));
const formatDate = (value?: string) => value ? new Intl.DateTimeFormat(locale.value === "ar" ? "ar-EG" : "en-GB", { day: "numeric", month: "short" }).format(new Date(value)) : "-";
</script>

<template>
  <section class="page-stack">
    <header class="page-header">
      <div><h1 class="page-title">{{ t("dashboards.employee.title") }}</h1><p class="page-description">{{ t("dashboards.employee.description") }}</p></div>
      <UButton to="/employee/schedule" :label="t('common.schedule')" icon="i-lucide-calendar-clock" />
    </header>
    <div class="metric-grid xl:grid-cols-3">
      <NuxtLink v-for="metric in metrics" :key="metric.to" :to="metric.to" class="metric-tile"><p class="metric-label">{{ metric.label }}</p><p class="metric-value">{{ metric.value }}</p><span class="metric-action">{{ t("common.viewAll") }}</span></NuxtLink>
    </div>
    <div class="dashboard-grid">
      <section class="operation-panel">
        <div class="panel-header"><div><h2 class="panel-title">{{ t("dashboards.workQueue") }}</h2><p class="mt-1 text-xs text-[var(--drixal-muted)]">{{ t("dashboards.workQueueDescription") }}</p></div><NuxtLink to="/employee/orders" class="panel-link">{{ t("common.viewAll") }}</NuxtLink></div>
        <div v-if="active.length" class="table-scroll border-0"><table class="business-table"><thead><tr><th>{{ t("common.order") }}</th><th>{{ t("common.customer") }}</th><th>{{ t("common.service") }}</th><th>{{ t("common.status") }}</th><th>{{ t("common.scheduledDate") }}</th></tr></thead><tbody><tr v-for="order in active.slice(0, 6)" :key="order._id"><td><NuxtLink :to="`/employee/orders/${order._id}`" class="font-bold text-[var(--drixal-blue)]">{{ order.orderNumber }}</NuxtLink><div class="mt-1 max-w-52 truncate text-xs text-[var(--drixal-muted)]">{{ order.title }}</div></td><td>{{ order.customerId?.name || "-" }}</td><td>{{ order.serviceId?.name || "-" }}</td><td><UBadge :label="t(`statuses.${order.status}`)" :color="statusColor(order.status)" variant="soft" /></td><td>{{ formatDate(order.scheduledDate) }}</td></tr></tbody></table></div>
        <p v-else class="p-6 text-sm text-[var(--drixal-muted)]">{{ t("dashboards.noActiveWork") }}</p>
      </section>
      <section class="operation-panel"><div class="panel-header"><h2 class="panel-title">{{ t("dashboards.statusDistribution") }}</h2></div><div class="pipeline-list"><div v-for="item in distribution" :key="item.status" class="pipeline-item"><span class="pipeline-label">{{ item.label }}</span><span class="pipeline-value">{{ item.value }}</span><div class="pipeline-track"><div class="pipeline-fill" :style="{ width: `${(item.value / distributionMax) * 100}%` }" /></div></div></div></section>
    </div>
  </section>
</template>
