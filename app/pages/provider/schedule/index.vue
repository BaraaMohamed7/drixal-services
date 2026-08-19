<script setup lang="ts">
definePageMeta({ layout: "workspace" });
type ScheduleOrder = {
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

const { t } = useLocale();
const route = useRoute();
const orderBase = computed(() => route.path.startsWith("/employee") ? "/employee/orders" : route.path.startsWith("/company-admin") ? "/company-admin/orders" : "/provider/orders");
const { data, pending, error } = await useFetch<{ items: ScheduleOrder[] }>("/api/service-orders");
const orders = computed(() => (data.value?.items || []).filter((order) => order.status !== "CANCELLED" && order.status !== "COMPLETED"));

const statusColor = (value: ScheduleOrder["status"]) => ({
  DRAFT: "neutral",
  SCHEDULED: "info",
  ASSIGNED: "primary",
  IN_PROGRESS: "primary",
  ON_HOLD: "warning",
  COMPLETED: "success",
  CANCELLED: "error",
}[value]);
</script>

<template>
  <section class="grid gap-4 overflow-hidden pb-8">
    <header class="page-header block">
      <h1 class="page-title">{{ t("schedule.title") }}</h1>
      <p class="drixal-muted mt-2 max-w-2xl text-sm">{{ t("schedule.description") }}</p>
    </header>

    <p v-if="error" class="drixal-danger rounded-xl p-4 font-semibold">{{ error.message }}</p>
    <p v-else-if="pending" class="drixal-panel rounded-xl p-6 text-center font-semibold drixal-muted">{{ t("schedule.loading") }}</p>

    <div v-else-if="orders.length" class="table-scroll">
      <table class="business-table">
        <thead>
          <tr>
            <th>{{ t("schedule.date") }}</th>
            <th>{{ t("common.order") }}</th>
            <th>{{ t("common.customer") }}</th>
            <th>{{ t("common.service") }}</th>
            <th>{{ t("common.assignedTo") }}</th>
            <th>{{ t("common.status") }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in orders" :key="order._id">
            <td>{{ order.scheduledDate ? new Date(order.scheduledDate).toLocaleDateString() : '-' }}</td>
            <td>
               <NuxtLink :to="`${orderBase}/${order._id}`" class="font-bold text-[var(--drixal-blue)] hover:underline">{{ order.orderNumber }}</NuxtLink>
              <div class="drixal-muted mt-1 text-xs">{{ order.title }}</div>
            </td>
            <td>{{ order.customerId?.name || '-' }}</td>
            <td>{{ order.serviceId?.name || '-' }}</td>
            <td>{{ order.assignedTo || '-' }}</td>
            <td><UBadge :label="t(`statuses.${order.status}`)" :color="statusColor(order.status)" variant="soft" /></td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else class="drixal-panel rounded-xl border-dashed p-6 text-center">
      <h2 class="text-lg font-semibold">{{ t("schedule.emptyTitle") }}</h2>
      <p class="drixal-muted mt-2">{{ t("schedule.emptyDescription") }}</p>
    </div>
  </section>
</template>
