<script setup lang="ts">
definePageMeta({ layout: "workspace" });
const { t } = useLocale();
const [{ data: requests }, { data: orders }] = await Promise.all([
  useFetch<{ items: Array<{ status: string }> }>("/api/customer/requests"),
  useFetch<{ items: Array<{ status: string }> }>("/api/customer/orders"),
]);
const requestItems = computed(() => requests.value?.items || []);
const orderItems = computed(() => orders.value?.items || []);
</script>

<template>
  <section class="grid gap-5 pb-8">
    <div><p class="text-xs font-black uppercase tracking-[0.18em] text-[var(--drixal-blue)]">{{ t("dashboards.customer.eyebrow") }}</p><h1 class="mt-2 text-2xl font-semibold">{{ t("dashboards.customer.title") }}</h1><p class="drixal-muted mt-2 text-sm">{{ t("dashboards.customer.description") }}</p></div>
    <div class="grid gap-3 sm:grid-cols-3">
      <NuxtLink to="/customer/requests" class="drixal-card rounded-xl p-5 transition hover:border-[var(--color-brand-border)]"><p class="drixal-muted text-xs font-bold">{{ t("common.requests") }}</p><p class="mt-3 text-3xl font-semibold">{{ requestItems.length }}</p></NuxtLink>
      <NuxtLink to="/customer/orders" class="drixal-card rounded-xl p-5 transition hover:border-[var(--color-brand-border)]"><p class="drixal-muted text-xs font-bold">{{ t("common.orders") }}</p><p class="mt-3 text-3xl font-semibold">{{ orderItems.length }}</p></NuxtLink>
      <div class="drixal-card rounded-xl p-5"><p class="drixal-muted text-xs font-bold">{{ t("dashboards.activeOrders") }}</p><p class="mt-3 text-3xl font-semibold">{{ orderItems.filter(item => !['COMPLETED', 'CANCELLED'].includes(item.status)).length }}</p></div>
    </div>
    <div class="drixal-panel rounded-xl p-5"><div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><h2 class="text-lg font-semibold">{{ t("dashboards.findService") }}</h2><p class="drixal-muted mt-1 text-sm">{{ t("dashboards.findServiceDescription") }}</p></div><UButton to="/marketplace" :label="t('common.marketplace')" icon="i-lucide-store" /></div></div>
  </section>
</template>
