<script setup lang="ts">
definePageMeta({ layout: "workspace" });
const { t } = useLocale();
const [{ data: services }, { data: requests }, { data: orders }, { data: customers }] = await Promise.all([
  useFetch<{ items: unknown[] }>("/api/services"),
  useFetch<{ items: Array<{ status: string }> }>("/api/service-requests"),
  useFetch<{ items: Array<{ status: string }> }>("/api/service-orders"),
  useFetch<{ items: unknown[] }>("/api/customers"),
]);
const metrics = computed(() => [
  { label: t("common.services"), value: services.value?.items.length || 0, to: "/company-admin/services" },
  { label: t("dashboards.openRequests"), value: requests.value?.items.filter((item) => !["REJECTED", "CONVERTED", "CANCELLED", "CLOSED"].includes(item.status)).length || 0, to: "/company-admin/requests" },
  { label: t("dashboards.activeOrders"), value: orders.value?.items.filter((item) => !["COMPLETED", "CANCELLED"].includes(item.status)).length || 0, to: "/company-admin/orders" },
  { label: t("common.customers"), value: customers.value?.items.length || 0, to: "/company-admin/customers" },
]);
</script>
<template><section class="grid gap-5 pb-8"><div><p class="text-xs font-black uppercase tracking-[0.18em] text-[var(--drixal-blue)]">{{ t("dashboards.companyAdmin.eyebrow") }}</p><h1 class="mt-2 text-2xl font-semibold">{{ t("dashboards.companyAdmin.title") }}</h1><p class="drixal-muted mt-2 text-sm">{{ t("dashboards.companyAdmin.description") }}</p></div><div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><NuxtLink v-for="metric in metrics" :key="metric.to" :to="metric.to" class="drixal-card rounded-xl p-5 transition hover:border-[var(--color-brand-border)]"><p class="drixal-muted text-xs font-bold">{{ metric.label }}</p><p class="mt-3 text-3xl font-semibold">{{ metric.value }}</p></NuxtLink></div><div class="drixal-panel rounded-xl p-5"><h2 class="text-lg font-semibold">{{ t("dashboards.nextActions") }}</h2><div class="mt-4 flex flex-wrap gap-2"><UButton to="/company-admin/requests" :label="t('common.requests')" /><UButton to="/company-admin/schedule" :label="t('common.schedule')" color="neutral" variant="outline" /><UButton to="/company-admin/services/new" :label="t('common.createService')" color="neutral" variant="outline" /></div></div></section></template>
