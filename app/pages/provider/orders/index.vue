<script setup lang="ts">
type ServiceOrderItem = {
  _id: string;
  orderNumber: string;
  title: string;
  status: "DRAFT" | "SCHEDULED" | "ASSIGNED" | "IN_PROGRESS" | "ON_HOLD" | "COMPLETED" | "CANCELLED";
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  scheduledDate?: string;
  assignedTo?: string;
  customerId?: { name: string };
  serviceId?: { name: string };
};

const route = useRoute();
const router = useRouter();
const { t } = useLocale();
const orderBase = computed(() => route.path.startsWith("/employee") ? "/employee/orders" : route.path.startsWith("/company-admin") ? "/company-admin/orders" : "/provider/orders");
const allOptionValue = "__all__";
const search = ref(typeof route.query.search === "string" ? route.query.search : "");
const status = ref(typeof route.query.status === "string" ? route.query.status : allOptionValue);
const statusOptions = computed(() => [
  { label: t("common.allStatuses"), value: allOptionValue },
  { label: t("statuses.DRAFT"), value: "DRAFT" },
  { label: t("statuses.SCHEDULED"), value: "SCHEDULED" },
  { label: t("statuses.ASSIGNED"), value: "ASSIGNED" },
  { label: t("statuses.IN_PROGRESS"), value: "IN_PROGRESS" },
  { label: t("statuses.ON_HOLD"), value: "ON_HOLD" },
  { label: t("statuses.COMPLETED"), value: "COMPLETED" },
  { label: t("statuses.CANCELLED"), value: "CANCELLED" },
]);
const query = computed(() => ({ search: search.value || undefined, status: status.value === allOptionValue ? undefined : status.value }));
const { data, pending, error } = await useFetch<{ items: ServiceOrderItem[] }>("/api/service-orders", { query });
const orders = computed(() => data.value?.items || []);

watch(query, (value) => router.replace({ query: value }), { deep: true });

const statusColor = (value: ServiceOrderItem["status"]) => ({
  DRAFT: "neutral",
  SCHEDULED: "info",
  ASSIGNED: "primary",
  IN_PROGRESS: "primary",
  ON_HOLD: "warning",
  COMPLETED: "success",
  CANCELLED: "error",
}[value]);

const priorityColor = (value: ServiceOrderItem["priority"]) => ({
  LOW: "neutral",
  MEDIUM: "info",
  HIGH: "warning",
  CRITICAL: "error",
}[value]);
</script>

<template>
  <section class="grid gap-4 overflow-hidden pb-8">
    <header class="page-header">
      <div class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 class="page-title">{{ t("serviceOrders.title") }}</h1>
          <p class="drixal-muted mt-2 max-w-2xl text-sm">{{ t("serviceOrders.description") }}</p>
        </div>
        <p class="drixal-muted text-sm font-bold">{{ t("serviceOrders.found", { count: orders.length }) }}</p>
      </div>
    </header>

    <div class="drixal-card flex flex-col gap-3 p-3 md:flex-row">
      <UInput v-model="search" class="min-w-0 flex-1" :placeholder="t('serviceOrders.searchPlaceholder')" />
      <USelect v-model="status" :items="statusOptions" label-key="label" value-key="value" class="min-w-0 md:w-56" />
    </div>

    <p v-if="error" class="drixal-danger rounded-xl p-4 font-semibold">{{ error.message }}</p>
    <p v-else-if="pending" class="drixal-panel rounded-xl p-6 text-center font-semibold drixal-muted">{{ t("serviceOrders.loading") }}</p>

    <div v-else-if="orders.length" class="table-scroll">
      <table class="business-table">
        <thead>
          <tr>
            <th>{{ t("common.order") }}</th>
            <th>{{ t("common.customer") }}</th>
            <th>{{ t("common.service") }}</th>
            <th>{{ t("common.status") }}</th>
            <th>{{ t("common.priority") }}</th>
            <th>{{ t("common.assignedTo") }}</th>
            <th>{{ t("common.scheduledDate") }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in orders" :key="order._id">
            <td>
               <NuxtLink :to="`${orderBase}/${order._id}`" class="font-bold text-[var(--drixal-blue)] hover:underline">{{ order.orderNumber }}</NuxtLink>
              <div class="drixal-muted mt-1 text-xs">{{ order.title }}</div>
            </td>
            <td>{{ order.customerId?.name || '-' }}</td>
            <td>{{ order.serviceId?.name || '-' }}</td>
            <td><UBadge :label="t(`statuses.${order.status}`)" :color="statusColor(order.status)" variant="soft" /></td>
            <td><UBadge :label="t(`statuses.${order.priority}`)" :color="priorityColor(order.priority)" variant="soft" /></td>
            <td>{{ order.assignedTo || '-' }}</td>
            <td>{{ order.scheduledDate ? new Date(order.scheduledDate).toLocaleDateString() : '-' }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else class="drixal-panel rounded-xl border-dashed p-6 text-center">
      <h2 class="text-lg font-semibold">{{ t("serviceOrders.emptyTitle") }}</h2>
      <p class="drixal-muted mt-2">{{ t("serviceOrders.emptyDescription") }}</p>
    </div>
  </section>
</template>
