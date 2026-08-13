<script setup lang="ts">
type Category = {
  _id: string;
  name: string;
  slug: string;
};

type MarketplaceService = {
  id: string;
  name: string;
  slug: string;
  description: string;
  pricing: {
    type: "FIXED" | "HOURLY" | "CUSTOM";
    amount?: number;
    currency: string;
  };
  duration?: number;
  locationType: string;
  scheduling: {
    required: boolean;
  };
  company: {
    name: string;
    slug: string;
    rating?: number;
    location: {
      city?: string;
      area?: string;
    };
  };
  category: {
    name: string;
    slug: string;
  };
};

const route = useRoute();
const router = useRouter();
const { t } = useLocale();
const allOptionValue = "__all__";

const filters = reactive({
  search: typeof route.query.search === "string" ? route.query.search : "",
  category: typeof route.query.category === "string" ? route.query.category : allOptionValue,
  city: typeof route.query.city === "string" ? route.query.city : allOptionValue,
  minPrice: typeof route.query.minPrice === "string" ? route.query.minPrice : "",
  maxPrice: typeof route.query.maxPrice === "string" ? route.query.maxPrice : "",
});

const query = computed(() => ({
  search: filters.search || undefined,
  category: filters.category === allOptionValue ? undefined : filters.category,
  city: filters.city === allOptionValue ? undefined : filters.city,
  minPrice: filters.minPrice || undefined,
  maxPrice: filters.maxPrice || undefined,
}));

watch(
  query,
  (value) => {
    router.replace({ query: value });
  },
  { deep: true },
);

const [{ data: categoriesData }, { data, pending, error }] = await Promise.all([
  useFetch<{ items: Category[] }>("/api/categories"),
  useFetch<{ items: MarketplaceService[]; pagination: { total: number } }>("/api/marketplace/services", { query }),
]);

const categories = computed(() => categoriesData.value?.items || []);
const services = computed(() => data.value?.items || []);
const total = computed(() => data.value?.pagination.total || 0);
const cities = computed(() => Array.from(new Set(services.value.map((service) => service.company.location.city).filter(Boolean))));
const categoryOptions = computed(() => [{ name: t("common.allCategories"), slug: allOptionValue }, ...categories.value]);
const cityOptions = computed(() => [{ label: t("common.city"), value: allOptionValue }, ...cities.value.map((city) => ({ label: city, value: city }))]);

const formatPrice = (service: MarketplaceService) => {
  if (service.pricing.type === "CUSTOM") return t("pricing.customQuote");
  const suffix = service.pricing.type === "HOURLY" ? t("pricing.hourlySuffix") : "";
  return `${service.pricing.amount ?? 0} ${service.pricing.currency}${suffix}`;
};

const resetFilters = () => {
  filters.search = "";
  filters.category = allOptionValue;
  filters.city = allOptionValue;
  filters.minPrice = "";
  filters.maxPrice = "";
};
</script>

<template>
  <section class="grid gap-5 overflow-hidden pb-8">
    <div class="carbon-card rounded-xl p-5">
      <div class="max-w-2xl">
        <p class="mb-3 text-xs font-black uppercase tracking-[0.2em] text-[var(--drixal-blue)]">{{ t("marketplace.eyebrow") }}</p>
        <h1 class="text-2xl font-semibold leading-8 tracking-tight text-[var(--drixal-ink)]">{{ t("marketplace.title") }}</h1>
        <p class="mt-3 text-sm leading-5 text-[var(--drixal-muted)]">{{ t("marketplace.description") }}</p>
      </div>
    </div>

    <div class="carbon-card grid max-w-full gap-3 rounded-xl p-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,0.8fr)_minmax(0,0.7fr)_minmax(0,0.7fr)_auto]">
      <UInput v-model="filters.search" class="min-w-0" :placeholder="t('marketplace.searchPlaceholder')" />
      <USelect v-model="filters.category" :items="categoryOptions" label-key="name" value-key="slug" class="min-w-0" />
      <USelect v-model="filters.city" :items="cityOptions" label-key="label" value-key="value" class="min-w-0" />
      <UInput v-model="filters.minPrice" type="number" min="0" class="min-w-0" :placeholder="t('marketplace.minPrice')" />
      <UInput v-model="filters.maxPrice" type="number" min="0" class="min-w-0" :placeholder="t('marketplace.maxPrice')" />
      <UButton :label="t('common.reset')" color="neutral" variant="outline" class="sm:col-span-2 lg:col-span-1" @click="resetFilters" />
    </div>

    <div class="flex flex-wrap items-center justify-between gap-3">
      <p class="drixal-muted text-sm font-bold">{{ t("marketplace.found", { count: total }) }}</p>
      <UButton to="/provider/services" :label="t('marketplace.providerDemo')" size="sm" />
    </div>

    <p v-if="error" class="drixal-danger rounded-xl p-4 font-semibold">{{ error.message }}</p>
    <p v-else-if="pending" class="drixal-panel rounded-xl p-6 text-center font-semibold drixal-muted">{{ t("marketplace.loading") }}</p>

    <div v-else-if="services.length" class="table-scroll">
      <table class="business-table">
        <thead>
          <tr>
            <th>{{ t("common.service") }}</th>
            <th>{{ t("common.provider") }}</th>
            <th>{{ t("common.category") }}</th>
            <th>{{ t("common.location") }}</th>
            <th>{{ t("common.price") }}</th>
            <th>{{ t("marketplace.viewService") }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="service in services" :key="service.id">
            <td>
              <div class="font-bold text-[var(--drixal-ink)]">{{ service.name }}</div>
              <div class="drixal-muted mt-1 max-w-md truncate text-xs">{{ service.description }}</div>
            </td>
            <td>
              <div class="font-semibold">{{ service.company.name }}</div>
              <div class="drixal-muted text-xs">{{ service.company.location.area }}{{ service.company.location.area && service.company.location.city ? ", " : "" }}{{ service.company.location.city }}</div>
            </td>
            <td><UBadge :label="service.category.name" color="primary" variant="soft" /></td>
            <td>{{ service.locationType }}</td>
            <td>{{ formatPrice(service) }}</td>
            <td><UButton :to="`/marketplace/services/${service.slug}`" :label="t('marketplace.viewService')" size="sm" /></td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else class="drixal-panel rounded-xl border-dashed p-6 text-center">
      <h2 class="text-xl font-black">{{ t("marketplace.noResultsTitle") }}</h2>
      <p class="drixal-muted mt-2">{{ t("marketplace.noResultsDescription") }}</p>
      <UButton class="mt-5" :label="t('marketplace.clearFilters')" @click="resetFilters" />
    </div>
  </section>
</template>
