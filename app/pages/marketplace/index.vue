<script setup lang="ts">
definePageMeta({ layout: "public" });

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
const auth = useAuth();
await auth.load();
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
  <section class="page-stack overflow-hidden">
    <header class="page-header">
      <div>
        <h1 class="page-title">{{ t("marketplace.title") }}</h1>
        <p class="page-description">{{ t("marketplace.description") }}</p>
      </div>
      <UButton :to="auth.session.value.authenticated ? '/register/company' : { path: '/auth/register', query: { next: '/register/company' } }" :label="t('marketplace.registerCompany')" color="neutral" variant="outline" />
    </header>

    <div class="operation-panel grid max-w-full items-end gap-3 p-4 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,0.8fr)_minmax(0,0.7fr)_minmax(0,0.7fr)_auto]">
      <UFormField :label="t('marketplace.searchLabel')"><UInput v-model="filters.search" class="min-w-0 w-full" :placeholder="t('marketplace.searchPlaceholder')" /></UFormField>
      <UFormField :label="t('common.category')"><USelect v-model="filters.category" :items="categoryOptions" label-key="name" value-key="slug" class="min-w-0 w-full" /></UFormField>
      <UFormField :label="t('common.city')"><USelect v-model="filters.city" :items="cityOptions" label-key="label" value-key="value" class="min-w-0 w-full" /></UFormField>
      <UFormField :label="t('marketplace.minPrice')"><UInput v-model="filters.minPrice" type="number" min="0" class="min-w-0 w-full" /></UFormField>
      <UFormField :label="t('marketplace.maxPrice')"><UInput v-model="filters.maxPrice" type="number" min="0" class="min-w-0 w-full" /></UFormField>
      <UButton :label="t('common.reset')" color="neutral" variant="outline" class="sm:col-span-2 lg:col-span-1" @click="resetFilters" />
    </div>

    <div class="flex flex-wrap items-center justify-between gap-3">
      <p class="drixal-muted text-sm font-bold">{{ t("marketplace.found", { count: total }) }}</p>
      <UButton v-if="auth.session.value.authenticated" :to="auth.workspaceHome.value" :label="t('shell.openWorkspace')" size="sm" />
    </div>

    <p v-if="error" class="drixal-danger rounded-xl p-4 font-semibold">{{ error.message }}</p>
    <p v-else-if="pending" class="drixal-panel rounded-xl p-6 text-center font-semibold drixal-muted">{{ t("marketplace.loading") }}</p>

    <template v-else-if="services.length">
      <div class="grid gap-3 sm:hidden">
        <NuxtLink v-for="service in services" :key="service.id" :to="`/marketplace/services/${service.slug}`" class="drixal-panel block p-4 transition-colors hover:bg-[var(--drixal-hover)]">
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <h2 class="truncate font-bold">{{ service.name }}</h2>
              <p class="mt-1 truncate text-xs text-[var(--drixal-muted)]">{{ service.company.name }}</p>
            </div>
            <UBadge :label="service.category.name" color="primary" variant="soft" />
          </div>
          <p class="mt-3 line-clamp-2 text-sm leading-5 text-[var(--drixal-muted)]">{{ service.description }}</p>
          <div class="mt-4 flex items-end justify-between gap-4 border-t border-[var(--drixal-line)] pt-3">
            <div class="text-xs text-[var(--drixal-muted)]">
              <p>{{ service.company.location.city || t("serviceDetail.flexible") }} · {{ service.locationType }}</p>
              <p class="mt-1 text-sm font-bold text-[var(--drixal-ink)]">{{ formatPrice(service) }}</p>
            </div>
            <span class="inline-flex items-center gap-1 text-sm font-bold text-[var(--drixal-blue)]">{{ t("marketplace.viewService") }} <UIcon name="i-lucide-arrow-right" class="size-4 rtl:rotate-180" /></span>
          </div>
        </NuxtLink>
      </div>

      <div class="table-scroll hidden sm:block">
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
              <NuxtLink :to="`/marketplace/services/${service.slug}`" class="font-bold text-[var(--drixal-blue)] hover:underline">{{ service.name }}</NuxtLink>
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
    </template>

    <div v-else class="drixal-panel rounded-xl border-dashed p-6 text-center">
      <h2 class="text-xl font-black">{{ t("marketplace.noResultsTitle") }}</h2>
      <p class="drixal-muted mt-2">{{ t("marketplace.noResultsDescription") }}</p>
      <UButton class="mt-5" :label="t('marketplace.clearFilters')" @click="resetFilters" />
    </div>
  </section>
</template>
