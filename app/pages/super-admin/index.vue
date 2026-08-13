<script setup lang="ts">
definePageMeta({ layout: "workspace" });
type CompanyItem = { _id: string; status: "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED"; createdAt: string; name: string; slug: string; location?: { city?: string } };
const { locale, t } = useLocale();
const { data, pending } = await useFetch<{ items: CompanyItem[] }>("/api/admin/companies");
const companies = computed(() => data.value?.items || []);
const counts = computed(() => ({ total: companies.value.length, pending: companies.value.filter((item) => item.status === "PENDING").length, approved: companies.value.filter((item) => item.status === "APPROVED").length, suspended: companies.value.filter((item) => item.status === "SUSPENDED").length }));
const metrics = computed(() => [
  { label: t("dashboards.totalCompanies"), value: counts.value.total },
  { label: t("statuses.PENDING"), value: counts.value.pending },
  { label: t("statuses.APPROVED"), value: counts.value.approved },
  { label: t("statuses.SUSPENDED"), value: counts.value.suspended },
]);
const distribution = computed(() => ["PENDING", "APPROVED", "REJECTED", "SUSPENDED"].map((status) => ({ status, label: t(`statuses.${status}`), value: companies.value.filter((item) => item.status === status).length })));
const distributionMax = computed(() => Math.max(1, ...distribution.value.map((item) => item.value)));
const reviewQueue = computed(() => companies.value.filter((item) => item.status === "PENDING").slice(0, 6));
const formatDate = (value: string) => new Intl.DateTimeFormat(locale.value === "ar" ? "ar-EG" : "en-GB", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value));
</script>

<template>
  <section class="page-stack">
    <header class="page-header"><div><h1 class="page-title">{{ t("dashboards.superAdmin.title") }}</h1><p class="page-description">{{ t("dashboards.superAdmin.description") }}</p></div><UButton to="/super-admin/companies" :label="t('common.companyReviews')" icon="i-lucide-building-2" /></header>
    <div class="metric-grid"><div v-for="metric in metrics" :key="metric.label" class="metric-tile"><p class="metric-label">{{ metric.label }}</p><p class="metric-value">{{ pending ? "-" : metric.value }}</p></div></div>
    <div class="dashboard-grid">
      <section class="operation-panel"><div class="panel-header"><div><h2 class="panel-title">{{ t("dashboards.reviewQueue") }}</h2><p class="mt-1 text-xs text-[var(--drixal-muted)]">{{ t("dashboards.reviewQueueDescription") }}</p></div><NuxtLink to="/super-admin/companies" class="panel-link">{{ t("common.viewAll") }}</NuxtLink></div><div v-if="reviewQueue.length" class="table-scroll border-0"><table class="business-table"><thead><tr><th>{{ t("common.company") }}</th><th>{{ t("common.location") }}</th><th>{{ t("common.status") }}</th><th>{{ t("companyAdmin.registered") }}</th></tr></thead><tbody><tr v-for="company in reviewQueue" :key="company._id"><td><p class="font-bold">{{ company.name }}</p><p class="mt-1 text-xs text-[var(--drixal-muted)]">{{ company.slug }}</p></td><td>{{ company.location?.city || "-" }}</td><td><UBadge :label="t(`statuses.${company.status}`)" color="warning" variant="soft" /></td><td>{{ formatDate(company.createdAt) }}</td></tr></tbody></table></div><p v-else class="p-6 text-sm text-[var(--drixal-muted)]">{{ t("dashboards.noPendingReviews") }}</p></section>
      <section class="operation-panel"><div class="panel-header"><h2 class="panel-title">{{ t("dashboards.statusDistribution") }}</h2></div><div class="pipeline-list"><div v-for="item in distribution" :key="item.status" class="pipeline-item"><span class="pipeline-label">{{ item.label }}</span><span class="pipeline-value">{{ item.value }}</span><div class="pipeline-track"><div class="pipeline-fill" :style="{ width: `${(item.value / distributionMax) * 100}%` }" /></div></div></div></section>
    </div>
  </section>
</template>
