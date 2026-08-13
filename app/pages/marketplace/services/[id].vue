<script setup lang="ts">
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
    description?: string;
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
const { t } = useLocale();
const { data: service, pending, error } = await useFetch<MarketplaceService>(`/api/marketplace/services/${route.params.id}`);
const requestPending = ref(false);
const requestError = ref("");
const requestSent = ref(false);
const requestForm = reactive({
  customer: {
    name: "",
    phone: "",
    email: "",
    city: "",
  },
  preferredDate: "",
  message: "",
});

const formatPrice = computed(() => {
  const value = service.value;
  if (!value) return "";
  if (value.pricing.type === "CUSTOM") return t("pricing.customQuote");
  const suffix = value.pricing.type === "HOURLY" ? t("pricing.hourlySuffix") : "";
  return `${value.pricing.amount ?? 0} ${value.pricing.currency}${suffix}`;
});

const submitRequest = async () => {
  requestPending.value = true;
  requestError.value = "";

  try {
    await $fetch(`/api/marketplace/services/${route.params.id}/requests`, {
      method: "POST",
      body: requestForm,
    });
    requestSent.value = true;
    requestForm.customer.name = "";
    requestForm.customer.phone = "";
    requestForm.customer.email = "";
    requestForm.customer.city = "";
    requestForm.preferredDate = "";
    requestForm.message = "";
  } catch (err) {
    requestError.value = err instanceof Error ? err.message : t("requestForm.fallbackError");
  } finally {
    requestPending.value = false;
  }
};
</script>

<template>
  <section class="mx-auto max-w-5xl overflow-hidden px-4 py-5 sm:px-6">
    <NuxtLink to="/marketplace" class="drixal-link-pill inline-flex rounded-full px-4 py-2 text-sm font-black">
      {{ t("common.backToMarketplace") }}
    </NuxtLink>

    <p v-if="error" class="drixal-danger mt-6 rounded-xl p-4 font-semibold">{{ error.message }}</p>
    <p v-else-if="pending" class="drixal-panel mt-6 rounded-xl p-6 text-center font-semibold drixal-muted">{{ t("serviceDetail.loading") }}</p>

    <div v-else-if="service" class="mt-5 grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
      <article class="drixal-panel min-w-0 overflow-hidden rounded-xl">
        <div class="bg-[var(--drixal-navy)] p-5 text-[var(--ui-text-inverted)] md:p-6">
          <div class="mb-4 flex flex-wrap gap-2">
            <span class="drixal-inverted-chip rounded-full px-3 py-1 text-xs font-black">{{ service.category.name }}</span>
            <span class="drixal-inverted-chip rounded-full px-3 py-1 text-xs font-bold opacity-80">{{ service.locationType }}</span>
          </div>
          <h1 class="text-2xl font-semibold leading-8 tracking-tight">{{ service.name }}</h1>
          <p class="mt-3 max-w-2xl text-sm leading-5 text-[var(--ui-text-inverted)] opacity-75">{{ service.description }}</p>
        </div>

        <div class="grid gap-3 p-5 md:grid-cols-3 md:p-6">
          <div class="rounded-lg bg-[var(--drixal-soft)] p-4">
            <p class="drixal-muted text-xs font-bold uppercase tracking-widest">{{ t("serviceDetail.pricing") }}</p>
            <p class="mt-2 text-xl font-black">{{ formatPrice }}</p>
          </div>
          <div class="rounded-lg bg-[var(--drixal-soft)] p-4">
            <p class="drixal-muted text-xs font-bold uppercase tracking-widest">{{ t("common.duration") }}</p>
            <p class="mt-2 text-xl font-black">{{ service.duration ? `${service.duration} min` : t("serviceDetail.flexible") }}</p>
          </div>
          <div class="rounded-lg bg-[var(--drixal-soft)] p-4">
            <p class="drixal-muted text-xs font-bold uppercase tracking-widest">{{ t("serviceDetail.scheduling") }}</p>
            <p class="mt-2 text-xl font-black">{{ service.scheduling.required ? t("serviceDetail.required") : t("serviceDetail.optional") }}</p>
          </div>
        </div>

        <div class="border-t border-[var(--drixal-line)] p-5 md:p-6">
          <div class="mb-4">
            <p class="drixal-muted text-xs font-black uppercase tracking-[0.2em]">{{ t("requestForm.eyebrow") }}</p>
            <h2 class="mt-2 text-xl font-black">{{ t("requestForm.title") }}</h2>
            <p class="drixal-muted mt-1 text-sm">{{ t("requestForm.description") }}</p>
          </div>

          <p v-if="requestSent" class="drixal-success mb-4 rounded-xl p-3 text-sm font-bold">{{ t("requestForm.success") }}</p>
          <p v-if="requestError" class="drixal-danger mb-4 rounded-xl p-3 text-sm font-bold">{{ requestError }}</p>

          <form class="grid gap-3" @submit.prevent="submitRequest">
            <div class="grid gap-3 sm:grid-cols-2">
              <UInput v-model="requestForm.customer.name" required class="min-w-0" :placeholder="t('requestForm.namePlaceholder')" />
              <UInput v-model="requestForm.customer.phone" required class="min-w-0" :placeholder="t('requestForm.phonePlaceholder')" />
              <UInput v-model="requestForm.customer.email" type="email" class="min-w-0" :placeholder="t('requestForm.emailPlaceholder')" />
              <UInput v-model="requestForm.customer.city" class="min-w-0" :placeholder="t('requestForm.cityPlaceholder')" />
            </div>
            <UInput v-model="requestForm.preferredDate" type="date" />
            <UTextarea v-model="requestForm.message" required :rows="3" class="min-w-0" :placeholder="t('requestForm.messagePlaceholder')" />
            <UButton type="submit" :disabled="requestPending" :label="requestPending ? t('requestForm.sending') : t('requestForm.submit')" />
          </form>
        </div>
      </article>

      <aside class="drixal-panel h-fit min-w-0 rounded-xl p-5">
        <p class="drixal-muted text-xs font-black uppercase tracking-[0.2em]">{{ t("serviceDetail.provider") }}</p>
        <h2 class="mt-3 text-2xl font-black tracking-tight">{{ service.company.name }}</h2>
        <p class="drixal-muted mt-3 leading-7">{{ service.company.description || t("serviceDetail.providerFallback") }}</p>

        <div class="mt-6 grid gap-3 text-sm font-bold text-[var(--drixal-ink)]">
          <div class="rounded-lg bg-[var(--drixal-soft)] p-4">
            {{ t("common.location") }}: {{ service.company.location.area }}{{ service.company.location.area && service.company.location.city ? ", " : "" }}{{ service.company.location.city }}
          </div>
          <div class="rounded-lg bg-[var(--drixal-soft)] p-4">
            {{ t("common.rating") }}: {{ service.company.rating || 0 }}/5
          </div>
        </div>

        <UButton class="mt-6 w-full" :label="t('serviceDetail.bookingComingSoon')" disabled />
      </aside>
    </div>
  </section>
</template>
