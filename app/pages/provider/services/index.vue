<script setup lang="ts">
type ServiceItem = {
  _id: string;
  name: string;
  description: string;
  pricing: {
    type: "FIXED" | "HOURLY" | "CUSTOM";
    amount?: number;
    currency: string;
  };
  duration?: number;
  locationType: string;
  operationalStatus: "ACTIVE" | "INACTIVE";
  publicationStatus: "DRAFT" | "PUBLISHED" | "UNPUBLISHED";
  categoryId?: {
    name: string;
  };
};

const route = useRoute();
const router = useRouter();
const { t } = useLocale();
const { hasPermission } = useProviderSession();
await useFetch("/api/session", { key: "provider-session" });
const allOptionValue = "__all__";
const search = ref(typeof route.query.search === "string" ? route.query.search : "");
const publicationStatus = ref(typeof route.query.publicationStatus === "string" ? route.query.publicationStatus : allOptionValue);
const refreshKey = ref(0);
const statusOptions = computed(() => [
  { label: t("common.allStatuses"), value: allOptionValue },
  { label: t("statuses.DRAFT"), value: "DRAFT" },
  { label: t("statuses.PUBLISHED"), value: "PUBLISHED" },
  { label: t("statuses.UNPUBLISHED"), value: "UNPUBLISHED" },
]);

const query = computed(() => ({
  search: search.value || undefined,
  publicationStatus: publicationStatus.value === allOptionValue ? undefined : publicationStatus.value,
  refreshKey: refreshKey.value,
}));

watch(
  () => ({
    search: search.value || undefined,
    publicationStatus: publicationStatus.value === allOptionValue ? undefined : publicationStatus.value,
  }),
  (value) => {
    router.replace({ query: value });
  },
);

const { data, pending, error, refresh } = await useFetch<{ items: ServiceItem[] }>("/api/services", { query });

const services = computed(() => data.value?.items || []);

const formatPrice = (service: ServiceItem) => {
  if (service.pricing.type === "CUSTOM") return t("pricing.customQuote");
  const suffix = service.pricing.type === "HOURLY" ? t("pricing.hourlySuffix") : "";
  return `${service.pricing.amount ?? 0} ${service.pricing.currency}${suffix}`;
};

const statusClass = (status: ServiceItem["publicationStatus"]) => ({
  DRAFT: "warning",
  PUBLISHED: "success",
  UNPUBLISHED: "neutral",
}[status]);

const publish = async (service: ServiceItem) => {
  await $fetch(`/api/services/${service._id}/publish`, { method: "POST" });
  refreshKey.value += 1;
  await refresh();
};

const unpublish = async (service: ServiceItem) => {
  await $fetch(`/api/services/${service._id}/unpublish`, { method: "POST" });
  refreshKey.value += 1;
  await refresh();
};
</script>

<template>
  <section class="grid gap-4 overflow-hidden pb-8">
    <div class="carbon-card rounded-xl p-5">
      <div class="grid gap-5 md:grid-cols-[1.4fr_0.6fr]">
        <div>
          <p class="mb-2 text-xs font-black uppercase tracking-[0.2em] text-[var(--drixal-blue)]">{{ t("providerServices.eyebrow") }}</p>
          <h1 class="max-w-2xl text-2xl font-semibold leading-8 tracking-tight text-[var(--drixal-ink)]">{{ t("providerServices.title") }}</h1>
          <p class="mt-3 max-w-xl text-sm leading-6 text-[var(--drixal-muted)]">{{ t("providerServices.description") }}</p>
        </div>

        <div class="rounded-lg border border-[var(--drixal-line)] p-4">
          <p class="text-sm font-bold text-[var(--drixal-muted)]">{{ t("providerServices.currentSlice") }}</p>
          <div class="mt-4 grid grid-cols-3 gap-2 text-center">
            <div class="rounded-lg border border-[var(--drixal-line)] p-3">
              <p class="text-xl font-black">{{ services.length }}</p>
              <p class="drixal-muted text-xs font-bold">{{ t("common.services") }}</p>
            </div>
            <div class="rounded-lg border border-[var(--drixal-line)] p-3">
              <p class="text-xl font-black">{{ services.filter((service) => service.publicationStatus === "PUBLISHED").length }}</p>
              <p class="text-xs font-bold">{{ t("providerServices.published") }}</p>
            </div>
            <div class="rounded-lg border border-[var(--drixal-line)] p-3">
              <p class="text-xl font-black">{{ services.filter((service) => service.publicationStatus === "DRAFT").length }}</p>
              <p class="text-xs font-bold">{{ t("providerServices.drafts") }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="carbon-card flex flex-col gap-3 rounded-xl p-3 md:flex-row md:items-center md:justify-between">
      <div class="flex flex-1 flex-col gap-3 md:flex-row">
        <UInput v-model="search" class="min-w-0 flex-1" :placeholder="t('providerServices.searchPlaceholder')" />
        <USelect v-model="publicationStatus" :items="statusOptions" label-key="label" value-key="value" class="min-w-0 md:w-56" />
      </div>

      <UButton v-if="hasPermission('services.manage')" to="/provider/services/new" :label="t('common.createService')" />
    </div>

    <p v-if="error" class="drixal-danger rounded-xl p-4 font-semibold">{{ error.message }}</p>
    <p v-else-if="pending" class="drixal-panel rounded-xl p-6 text-center font-semibold drixal-muted">{{ t("providerServices.loading") }}</p>

    <div v-else-if="services.length" class="table-scroll">
      <table class="business-table">
        <thead>
          <tr>
            <th>{{ t("common.service") }}</th>
            <th>{{ t("common.category") }}</th>
            <th>{{ t("common.price") }}</th>
            <th>{{ t("common.status") }}</th>
            <th>{{ t("common.duration") }}</th>
            <th>{{ t("common.edit") }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="service in services" :key="service._id">
            <td>
              <div class="font-bold text-[var(--drixal-ink)]">{{ service.name }}</div>
              <div class="drixal-muted mt-1 max-w-md truncate text-xs">{{ service.description }}</div>
            </td>
            <td>{{ service.categoryId?.name || t("providerServices.uncategorized") }}</td>
            <td>{{ formatPrice(service) }}</td>
            <td><UBadge :label="t(`statuses.${service.publicationStatus}`)" :color="statusClass(service.publicationStatus)" variant="soft" /></td>
            <td>{{ service.duration ? `${service.duration} min` : '-' }}</td>
            <td>
              <div class="flex flex-wrap gap-2">
                 <UButton v-if="hasPermission('services.manage')" :to="`/provider/services/${service._id}/edit`" :label="t('common.edit')" size="sm" color="neutral" variant="outline" />
                 <UButton v-if="hasPermission('services.publish') && service.publicationStatus !== 'PUBLISHED'" :label="t('common.publish')" size="sm" @click="publish(service)" />
                 <UButton v-else-if="hasPermission('services.publish')" :label="t('common.unpublish')" size="sm" color="neutral" variant="soft" @click="unpublish(service)" />
                 <span v-if="!hasPermission('services.manage') && !hasPermission('services.publish')" class="drixal-muted text-xs font-semibold">{{ t("permissions.readOnly") }}</span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else class="drixal-panel rounded-xl border-dashed p-6 text-center">
      <h2 class="text-xl font-black">{{ t("providerServices.emptyTitle") }}</h2>
      <p class="drixal-muted mt-2">{{ t("providerServices.emptyDescription") }}</p>
       <UButton v-if="hasPermission('services.manage')" to="/provider/services/new" class="mt-5" :label="t('common.createService')" />
    </div>
  </section>
</template>
