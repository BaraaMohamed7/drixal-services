<script setup lang="ts">
definePageMeta({ layout: "workspace" });

type RequestItem = { status: string };
type OrderItem = {
  _id: string;
  orderNumber: string;
  title: string;
  status: "DRAFT" | "SCHEDULED" | "ASSIGNED" | "IN_PROGRESS" | "ON_HOLD" | "COMPLETED" | "CANCELLED";
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  scheduledDate?: string;
  customerId?: { name?: string };
};

const { locale, t } = useLocale();
const [{ data: services }, { data: requests }, { data: orders }, { data: customers }] = await Promise.all([
  useFetch<{ items: unknown[] }>("/api/services"),
  useFetch<{ items: RequestItem[] }>("/api/service-requests"),
  useFetch<{ items: OrderItem[] }>("/api/service-orders"),
  useFetch<{ items: unknown[] }>("/api/customers"),
]);

const requestItems = computed(() => requests.value?.items || []);
const orderItems = computed(() => orders.value?.items || []);
const activeOrders = computed(() => orderItems.value.filter((item) => !["COMPLETED", "CANCELLED"].includes(item.status)));
const metrics = computed(() => [
  { label: t("common.services"), value: services.value?.items.length || 0, to: "/company-admin/services" },
  { label: t("dashboards.openRequests"), value: requestItems.value.filter((item) => !["REJECTED", "CONVERTED", "CANCELLED", "CLOSED"].includes(item.status)).length, to: "/company-admin/requests" },
  { label: t("dashboards.activeOrders"), value: activeOrders.value.length, to: "/company-admin/orders" },
  { label: t("common.customers"), value: customers.value?.items.length || 0, to: "/company-admin/customers" },
]);
const pipeline = computed(() => ["NEW", "UNDER_REVIEW", "APPROVED", "CONVERTED"].map((status) => ({
  status,
  label: t(`statuses.${status}`),
  value: requestItems.value.filter((item) => item.status === status).length,
})));
const pipelineMax = computed(() => Math.max(1, ...pipeline.value.map((item) => item.value)));
const recentOrders = computed(() => activeOrders.value.slice(0, 6));
const formatDate = (value?: string) => value ? new Intl.DateTimeFormat(locale.value === "ar" ? "ar-EG" : "en-GB", { day: "numeric", month: "short" }).format(new Date(value)) : "-";
const statusColor = (value: OrderItem["status"]) => ({ DRAFT: "neutral", SCHEDULED: "info", ASSIGNED: "primary", IN_PROGRESS: "primary", ON_HOLD: "warning", COMPLETED: "success", CANCELLED: "error" }[value]);
</script>

<template>
  <section class="page-stack">
    <header class="page-header">
      <div>
        <h1 class="page-title">{{ t("dashboards.companyAdmin.title") }}</h1>
        <p class="page-description">{{ t("dashboards.companyAdmin.description") }}</p>
      </div>
      <div class="flex flex-wrap gap-2">
        <UButton to="/company-admin/schedule" :label="t('common.schedule')" color="neutral" variant="outline" icon="i-lucide-calendar-days" />
        <UButton to="/company-admin/services/new" :label="t('common.createService')" />
      </div>
    </header>

    <div class="metric-grid">
      <NuxtLink v-for="metric in metrics" :key="metric.to" :to="metric.to" class="metric-tile">
        <p class="metric-label">{{ metric.label }}</p>
        <p class="metric-value">{{ metric.value }}</p>
        <span class="metric-action">{{ t("common.viewAll") }}</span>
      </NuxtLink>
    </div>

    <div class="dashboard-grid">
      <section class="operation-panel">
        <div class="panel-header">
          <div>
            <h2 class="panel-title">{{ t("dashboards.workQueue") }}</h2>
            <p class="mt-1 text-xs text-[var(--drixal-muted)]">{{ t("dashboards.workQueueDescription") }}</p>
          </div>
          <NuxtLink to="/company-admin/orders" class="panel-link">{{ t("common.viewAll") }}</NuxtLink>
        </div>
        <div v-if="recentOrders.length" class="table-scroll border-0">
          <table class="business-table">
            <thead><tr><th>{{ t("common.order") }}</th><th>{{ t("common.customer") }}</th><th>{{ t("common.status") }}</th><th>{{ t("common.priority") }}</th><th>{{ t("common.scheduledDate") }}</th></tr></thead>
            <tbody>
              <tr v-for="order in recentOrders" :key="order._id">
                <td><NuxtLink :to="`/company-admin/orders/${order._id}`" class="font-bold text-[var(--drixal-blue)]">{{ order.orderNumber }}</NuxtLink><div class="mt-1 max-w-60 truncate text-xs text-[var(--drixal-muted)]">{{ order.title }}</div></td>
                <td>{{ order.customerId?.name || "-" }}</td>
                <td><UBadge :label="t(`statuses.${order.status}`)" :color="statusColor(order.status)" variant="soft" /></td>
                <td>{{ t(`statuses.${order.priority}`) }}</td>
                <td>{{ formatDate(order.scheduledDate) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p v-else class="p-6 text-sm text-[var(--drixal-muted)]">{{ t("dashboards.noActiveWork") }}</p>
      </section>

      <section class="operation-panel">
        <div class="panel-header">
          <h2 class="panel-title">{{ t("dashboards.demandPipeline") }}</h2>
          <NuxtLink to="/company-admin/requests" class="panel-link">{{ t("common.viewAll") }}</NuxtLink>
        </div>
        <div class="pipeline-list">
          <div v-for="item in pipeline" :key="item.status" class="pipeline-item">
            <span class="pipeline-label">{{ item.label }}</span>
            <span class="pipeline-value">{{ item.value }}</span>
            <div class="pipeline-track"><div class="pipeline-fill" :style="{ width: `${(item.value / pipelineMax) * 100}%` }" /></div>
          </div>
        </div>
      </section>
    </div>
  </section>
</template>
