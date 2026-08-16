<script setup lang="ts">
definePageMeta({ layout: "public" });

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
  locationType: string;
  category: {
    name: string;
  };
};

type PublicCompany = {
  id: string;
  name: string;
  slug: string;
  description: string;
  rating: number;
  location: {
    city?: string;
    area?: string;
  };
};

const route = useRoute();
const { t } = useLocale();
const slug = String(route.params.companySlug);
const { data, pending, error } = await useFetch<{ company: PublicCompany; services: MarketplaceService[] }>(`/api/marketplace/companies/${slug}`);
const company = computed(() => data.value?.company || null);
const services = computed(() => data.value?.services || []);

const formatPrice = (service: MarketplaceService) => {
  if (service.pricing.type === "CUSTOM") return t("pricing.customQuote");
  const suffix = service.pricing.type === "HOURLY" ? t("pricing.hourlySuffix") : "";
  return `${service.pricing.amount ?? 0} ${service.pricing.currency}${suffix}`;
};
</script>

<template>
  <section class="mx-auto max-w-6xl overflow-hidden pb-8">
    <NuxtLink to="/marketplace" class="drixal-link-pill inline-flex px-4 py-2 text-sm font-bold">
      {{ t("common.backToMarketplace") }}
    </NuxtLink>

    <p v-if="error" class="drixal-danger mt-6 rounded-xl p-4 font-semibold">{{ t("companyPublic.notFound") }}</p>
    <p v-else-if="pending" class="drixal-panel mt-6 rounded-xl p-6 text-center font-semibold drixal-muted">{{ t("companyPublic.loading") }}</p>

    <div v-else-if="company" class="mt-5 grid min-w-0 gap-5">
      <article class="drixal-panel min-w-0 overflow-hidden">
        <div class="border-b border-[var(--color-brand-border)] bg-[var(--color-brand-subtle)] p-5 md:p-6">
          <p class="drixal-inverted-chip inline-flex px-3 py-1 text-xs font-bold">{{ t("companyPublic.eyebrow") }}</p>
          <h1 class="mt-4 text-2xl font-semibold leading-8 tracking-tight">{{ company.name }}</h1>
          <p class="mt-3 max-w-2xl text-sm leading-6 text-[var(--drixal-muted)]">{{ company.description || t("serviceDetail.providerFallback") }}</p>
          <div class="mt-4 flex flex-wrap gap-4 text-sm font-bold text-[var(--drixal-ink)]">
            <span>{{ t("common.rating") }}: {{ company.rating || 0 }}/5</span>
            <span v-if="company.location.city || company.location.area">
              {{ t("common.location") }}: {{ company.location.area }}{{ company.location.area && company.location.city ? ", " : "" }}{{ company.location.city }}
            </span>
          </div>
        </div>
      </article>

      <article class="drixal-panel min-w-0 p-5 md:p-6">
        <div class="mb-4">
          <h2 class="text-xl font-bold">{{ t("companyPublic.servicesTitle") }}</h2>
          <p class="drixal-muted mt-1 text-sm">{{ t("companyPublic.servicesDescription") }}</p>
        </div>

        <div v-if="services.length" class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <NuxtLink
            v-for="service in services"
            :key="service.id"
            :to="`/marketplace/companies/${company.slug}/services/${service.slug}`"
            class="drixal-panel block p-4 transition-colors hover:bg-[var(--drixal-hover)]"
          >
            <div class="flex items-start justify-between gap-3">
              <h3 class="min-w-0 truncate font-bold">{{ service.name }}</h3>
              <UBadge :label="service.category.name" color="primary" variant="soft" />
            </div>
            <p class="mt-3 line-clamp-2 text-sm leading-5 text-[var(--drixal-muted)]">{{ service.description }}</p>
            <div class="mt-4 flex items-center justify-between gap-3 border-t border-[var(--drixal-line)] pt-3 text-sm">
              <span class="font-bold text-[var(--drixal-ink)]">{{ formatPrice(service) }}</span>
              <span class="inline-flex items-center gap-1 font-bold text-[var(--drixal-blue)]">{{ t("companyPublic.viewService") }} <UIcon name="i-lucide-arrow-right" class="size-4 rtl:rotate-180" /></span>
            </div>
          </NuxtLink>
        </div>

        <div v-else class="drixal-panel rounded-xl border-dashed p-6 text-center">
          <h3 class="text-lg font-semibold">{{ t("companyPublic.noServices") }}</h3>
          <p class="drixal-muted mt-2 text-sm">{{ t("companyPublic.noServicesDescription") }}</p>
        </div>
      </article>
    </div>
  </section>
</template>