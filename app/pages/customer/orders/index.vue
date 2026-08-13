<script setup lang="ts">
definePageMeta({ layout: "workspace" });

type OrderItem = {
  _id: string;
  orderNumber: string;
  title: string;
  status: string;
  scheduledDate?: string;
  companyId?: { name?: string };
  serviceId?: { name?: string };
};

const { locale, t } = useLocale();
const { data, pending, error } = await useFetch<{ items: OrderItem[] }>("/api/customer/orders");
const items = computed(() => data.value?.items || []);
const formatDate = (value?: string) => value
  ? new Intl.DateTimeFormat(locale.value === "ar" ? "ar-EG" : "en-GB", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value))
  : "-";
</script>

<template>
  <section class="page-stack">
    <header class="page-header">
      <div>
        <h1 class="page-title">{{ t("customerPortal.ordersTitle") }}</h1>
        <p class="page-description">{{ t("customerPortal.ordersDescription") }}</p>
      </div>
      <UButton to="/marketplace" :label="t('dashboards.findServiceAction')" icon="i-lucide-store" />
    </header>

    <p v-if="error" class="drixal-danger p-4 font-semibold">{{ error.message }}</p>
    <p v-else-if="pending" class="drixal-panel p-6 text-center drixal-muted">{{ t("common.loading") }}</p>

    <div v-else-if="items.length" class="table-scroll">
      <table class="business-table">
        <thead><tr><th>{{ t("common.order") }}</th><th>{{ t("common.provider") }}</th><th>{{ t("common.service") }}</th><th>{{ t("common.status") }}</th><th>{{ t("common.scheduledDate") }}</th></tr></thead>
        <tbody>
          <tr v-for="item in items" :key="item._id">
            <td><NuxtLink :to="`/customer/orders/${item._id}`" class="font-bold text-[var(--drixal-blue)] hover:underline">{{ item.orderNumber }}</NuxtLink><div class="drixal-muted mt-1 text-xs">{{ item.title }}</div></td>
            <td>{{ item.companyId?.name || "-" }}</td>
            <td>{{ item.serviceId?.name || "-" }}</td>
            <td><UBadge :label="t(`statuses.${item.status}`)" :color="statusColor(item.status)" variant="soft" /></td>
            <td>{{ formatDate(item.scheduledDate) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else class="drixal-panel border-dashed p-6 text-center">
      <h2 class="text-lg font-semibold">{{ t("customerPortal.noOrders") }}</h2>
      <p class="drixal-muted mt-2">{{ t("customerPortal.noOrdersDescription") }}</p>
      <UButton to="/marketplace" class="mt-4" :label="t('dashboards.findServiceAction')" />
    </div>
  </section>
</template>
