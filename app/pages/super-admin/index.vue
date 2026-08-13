<script setup lang="ts">
definePageMeta({ layout: "workspace" });
type CompanyItem = { _id: string; status: "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED"; createdAt: string; name: string };
const { t } = useLocale();
const { data, pending } = await useFetch<{ items: CompanyItem[] }>("/api/admin/companies");
const companies = computed(() => data.value?.items || []);
const counts = computed(() => ({
  total: companies.value.length,
  pending: companies.value.filter((item) => item.status === "PENDING").length,
  approved: companies.value.filter((item) => item.status === "APPROVED").length,
  suspended: companies.value.filter((item) => item.status === "SUSPENDED").length,
}));
</script>

<template>
  <section class="grid gap-5 pb-8">
    <div><p class="text-xs font-black uppercase tracking-[0.18em] text-[var(--drixal-blue)]">{{ t("dashboards.superAdmin.eyebrow") }}</p><h1 class="mt-2 text-2xl font-semibold">{{ t("dashboards.superAdmin.title") }}</h1><p class="drixal-muted mt-2 text-sm">{{ t("dashboards.superAdmin.description") }}</p></div>
    <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <div v-for="metric in [{label:t('dashboards.totalCompanies'),value:counts.total},{label:t('statuses.PENDING'),value:counts.pending},{label:t('statuses.APPROVED'),value:counts.approved},{label:t('statuses.SUSPENDED'),value:counts.suspended}]" :key="metric.label" class="drixal-card rounded-xl p-5"><p class="drixal-muted text-xs font-bold">{{ metric.label }}</p><p class="mt-3 text-3xl font-semibold">{{ pending ? '—' : metric.value }}</p></div>
    </div>
    <div class="drixal-panel rounded-xl p-5"><div class="flex items-start justify-between gap-4"><div><h2 class="text-lg font-semibold">{{ t("dashboards.reviewQueue") }}</h2><p class="drixal-muted mt-1 text-sm">{{ t("dashboards.reviewQueueDescription") }}</p></div><UButton to="/super-admin/companies" :label="t('common.companyReviews')" /></div></div>
  </section>
</template>
