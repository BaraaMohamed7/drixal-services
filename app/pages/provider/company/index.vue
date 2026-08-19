<script setup lang="ts">
definePageMeta({ layout: "workspace" });
type CompanyDetail = {
  name: string;
  slug: string;
  description?: string;
  status: "SETUP" | "ACTIVE" | "SUSPENDED";
  location: { city?: string; area?: string };
  createdAt: string;
};

const { t } = useLocale();
const { data: company, pending, error } = await useFetch<CompanyDetail>("/api/companies/current");
const statusColor = computed(() => ({
  SETUP: "warning",
  ACTIVE: "success",
  SUSPENDED: "error",
}[company.value?.status || "SETUP"]));
</script>

<template>
  <section class="grid gap-4 overflow-hidden pb-8">
    <div class="drixal-card p-5">
      <p class="mb-2 text-xs font-black uppercase tracking-[0.2em] text-[var(--drixal-blue)]">{{ t("companyProfile.eyebrow") }}</p>
      <h1 class="text-2xl font-semibold leading-8 tracking-tight">{{ t("companyProfile.title") }}</h1>
      <p class="drixal-muted mt-2 max-w-2xl text-sm">{{ t("companyProfile.description") }}</p>
    </div>

    <p v-if="error" class="drixal-danger rounded-xl p-4 font-semibold">{{ error.message }}</p>
    <p v-else-if="pending" class="drixal-panel rounded-xl p-6 text-center font-semibold drixal-muted">{{ t("companyProfile.loading") }}</p>

    <div v-else-if="company" class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div class="drixal-card p-5">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 class="text-xl font-semibold">{{ company.name }}</h2>
            <p class="drixal-muted mt-1 text-sm">{{ company.slug }}</p>
          </div>
          <UBadge :label="t(`statuses.${company.status}`)" :color="statusColor" variant="soft" />
        </div>
        <p class="drixal-muted mt-5 text-sm leading-6">{{ company.description || t("companyProfile.noDescription") }}</p>
        <dl class="mt-6 grid gap-4 border-t border-[var(--drixal-line)] pt-5 sm:grid-cols-2">
          <div><dt class="drixal-muted text-xs font-bold">{{ t("common.city") }}</dt><dd class="mt-1 font-semibold">{{ company.location.city || '-' }}</dd></div>
          <div><dt class="drixal-muted text-xs font-bold">{{ t("companyRegistration.area") }}</dt><dd class="mt-1 font-semibold">{{ company.location.area || '-' }}</dd></div>
        </dl>
      </div>

      <aside class="drixal-panel h-fit rounded-xl p-5">
        <h2 class="text-lg font-semibold">{{ t("companyProfile.approvalTitle") }}</h2>
        <p class="drixal-muted mt-2 text-sm leading-6">{{ t(`companyProfile.statusDescription.${company.status}`) }}</p>
        <p v-if="company.status !== 'ACTIVE'" class="mt-4 text-sm font-semibold text-[var(--drixal-ink)]">{{ t("companyProfile.publicationBlocked") }}</p>
      </aside>
    </div>
  </section>
</template>
