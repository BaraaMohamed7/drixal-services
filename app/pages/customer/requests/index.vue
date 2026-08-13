<script setup lang="ts">
definePageMeta({ layout: "workspace" });
type RequestItem = {
  _id: string;
  status: "NEW" | "UNDER_REVIEW" | "APPROVED" | "REJECTED" | "CONVERTED" | "CANCELLED" | "CONTACTED" | "CLOSED";
  message: string;
  preferredDate?: string;
  createdAt: string;
  serviceId?: { name?: string };
  companyId?: { name?: string };
};
const { t } = useLocale();
const { data, pending, error } = await useFetch<{ items: RequestItem[] }>("/api/customer/requests");
const items = computed(() => data.value?.items || []);
const statusColor = (status: RequestItem["status"]) => ({ NEW: "info", UNDER_REVIEW: "warning", APPROVED: "success", REJECTED: "error", CONVERTED: "success", CANCELLED: "neutral", CONTACTED: "warning", CLOSED: "neutral" }[status]);
</script>

<template>
  <section class="grid gap-4 pb-8">
    <div><p class="text-xs font-black uppercase tracking-[0.18em] text-[var(--drixal-blue)]">{{ t("customerPortal.requestsEyebrow") }}</p><h1 class="mt-2 text-2xl font-semibold">{{ t("customerPortal.requestsTitle") }}</h1><p class="drixal-muted mt-2 text-sm">{{ t("customerPortal.requestsDescription") }}</p></div>
    <p v-if="error" class="drixal-danger rounded-xl p-4 font-semibold">{{ error.message }}</p><p v-else-if="pending" class="drixal-panel rounded-xl p-6 text-center drixal-muted">{{ t("common.loading") }}</p>
    <div v-else-if="items.length" class="table-scroll"><table class="business-table"><thead><tr><th>{{ t("common.service") }}</th><th>{{ t("common.provider") }}</th><th>{{ t("common.status") }}</th><th>{{ t("providerRequests.preferred") }}</th><th>{{ t("companyAdmin.registered") }}</th></tr></thead><tbody><tr v-for="item in items" :key="item._id"><td><div class="font-bold">{{ item.serviceId?.name || t("common.service") }}</div><div class="drixal-muted mt-1 max-w-md truncate text-xs">{{ item.message }}</div></td><td>{{ item.companyId?.name || '-' }}</td><td><UBadge :label="t(`statuses.${item.status}`)" :color="statusColor(item.status)" variant="soft" /></td><td>{{ item.preferredDate ? new Date(item.preferredDate).toLocaleDateString() : '-' }}</td><td>{{ new Date(item.createdAt).toLocaleDateString() }}</td></tr></tbody></table></div>
    <div v-else class="drixal-panel rounded-xl border-dashed p-6 text-center"><h2 class="text-lg font-semibold">{{ t("customerPortal.noRequests") }}</h2><p class="drixal-muted mt-2">{{ t("customerPortal.noRequestsDescription") }}</p><UButton to="/marketplace" class="mt-4" :label="t('common.marketplace')" /></div>
  </section>
</template>
