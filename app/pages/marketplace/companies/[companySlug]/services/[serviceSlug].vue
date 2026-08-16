<script setup lang="ts">
definePageMeta({ layout: "workspace" });

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
  locationType: "PROVIDER" | "CUSTOMER" | "REMOTE" | "FLEXIBLE";
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
const auth = useAuth();
await auth.load();
const servicePath = `/marketplace/companies/${route.params.companySlug}/services/${route.params.serviceSlug}`;
const { data: service, pending, error } = await useFetch<MarketplaceService>(`/api${servicePath}`);
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
  if (!auth.session.value.authenticated) {
    await navigateTo({ path: "/auth/login", query: { next: route.fullPath } });
    return;
  }
  requestPending.value = true;
  requestError.value = "";

  try {
    await $fetch(`/api${servicePath}/requests`, {
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
  <section class="mx-auto max-w-6xl overflow-hidden pb-8">
    <NuxtLink to="/marketplace" class="drixal-link-pill inline-flex px-4 py-2 text-sm font-bold">
      {{ t("common.backToMarketplace") }}
    </NuxtLink>

    <p v-if="error" class="drixal-danger mt-6 rounded-xl p-4 font-semibold">{{ error.message }}</p>
    <p v-else-if="pending" class="drixal-panel mt-6 rounded-xl p-6 text-center font-semibold drixal-muted">{{ t("serviceDetail.loading") }}</p>

    <div v-else-if="service" class="mt-5 grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
      <article class="drixal-panel min-w-0 overflow-hidden">
        <div class="border-b border-[var(--color-brand-border)] bg-[var(--color-brand-subtle)] p-5 md:p-6">
          <div class="mb-4 flex flex-wrap gap-2">
            <span class="drixal-inverted-chip px-3 py-1 text-xs font-bold">{{ service.category.name }}</span>
            <span class="drixal-inverted-chip px-3 py-1 text-xs font-semibold opacity-80">{{ t(`enums.locationType.${service.locationType}`) }}</span>
          </div>
          <h1 class="text-2xl font-semibold leading-8 tracking-tight">{{ service.name }}</h1>
          <p class="mt-3 max-w-2xl text-sm leading-6 text-[var(--drixal-muted)]">{{ service.description }}</p>
        </div>

        <div class="grid gap-3 p-5 md:grid-cols-3 md:p-6">
          <div class="rounded-lg bg-[var(--drixal-soft)] p-4">
            <p class="drixal-muted text-xs font-bold">{{ t("serviceDetail.pricing") }}</p>
            <p class="mt-2 text-xl font-black">{{ formatPrice }}</p>
          </div>
          <div class="rounded-lg bg-[var(--drixal-soft)] p-4">
            <p class="drixal-muted text-xs font-bold">{{ t("common.duration") }}</p>
            <p class="mt-2 text-xl font-black">{{ service.duration ? `${service.duration} min` : t("serviceDetail.flexible") }}</p>
          </div>
          <div class="rounded-lg bg-[var(--drixal-soft)] p-4">
            <p class="drixal-muted text-xs font-bold">{{ t("serviceDetail.scheduling") }}</p>
            <p class="mt-2 text-xl font-black">{{ service.scheduling.required ? t("serviceDetail.required") : t("serviceDetail.optional") }}</p>
          </div>
        </div>

        <div class="border-t border-[var(--drixal-line)] p-5 md:p-6">
          <div class="mb-4">
            <h2 class="text-xl font-bold">{{ t("requestForm.title") }}</h2>
            <p class="drixal-muted mt-1 text-sm">{{ t("requestForm.description") }}</p>
          </div>

          <p v-if="requestSent" class="drixal-success mb-4 rounded-xl p-3 text-sm font-bold">{{ t("requestForm.success") }}</p>
          <p v-if="requestError" class="drixal-danger mb-4 rounded-xl p-3 text-sm font-bold">{{ requestError }}</p>

           <div v-if="!auth.session.value.authenticated" class="rounded-lg border border-[var(--color-info-border)] bg-[var(--color-info-bg)] p-4">
             <p class="font-bold">{{ t("requestForm.authRequired") }}</p>
             <p class="drixal-muted mt-1 text-sm">{{ t("requestForm.authRequiredDescription") }}</p>
             <UButton class="mt-4" :to="{ path: '/auth/login', query: { next: route.fullPath } }" :label="t('auth.signIn')" />
           </div>
           <form v-else class="grid gap-3" @submit.prevent="submitRequest">
            <div class="grid gap-3 sm:grid-cols-2">
              <UFormField :label="t('requestForm.name')" required><UInput v-model="requestForm.customer.name" required autocomplete="name" class="min-w-0 w-full" :placeholder="t('requestForm.namePlaceholder')" /></UFormField>
              <UFormField :label="t('common.phone')" required><UInput v-model="requestForm.customer.phone" type="tel" required autocomplete="tel" class="min-w-0 w-full" :placeholder="t('requestForm.phonePlaceholder')" /></UFormField>
              <UFormField :label="t('common.email')"><UInput v-model="requestForm.customer.email" type="email" autocomplete="email" class="min-w-0 w-full" :placeholder="t('requestForm.emailPlaceholder')" /></UFormField>
              <UFormField :label="t('common.city')"><UInput v-model="requestForm.customer.city" autocomplete="address-level2" class="min-w-0 w-full" :placeholder="t('requestForm.cityPlaceholder')" /></UFormField>
            </div>
            <UFormField v-if="service.scheduling.required" :label="t('requestForm.preferredDate')"><UInput v-model="requestForm.preferredDate" type="date" class="w-full" /></UFormField>
            <UFormField :label="t('requestForm.message')" required><UTextarea v-model="requestForm.message" required :rows="3" class="min-w-0 w-full" :placeholder="t('requestForm.messagePlaceholder')" /></UFormField>
            <div class="flex justify-end"><UButton type="submit" :loading="requestPending" :disabled="requestPending" :label="t('requestForm.submit')" /></div>
          </form>
        </div>
      </article>

      <aside class="drixal-panel h-fit min-w-0 p-5">
        <p class="drixal-muted text-xs font-bold">{{ t("serviceDetail.provider") }}</p>
        <NuxtLink :to="`/marketplace/companies/${service.company.slug}`" class="mt-3 block text-2xl font-bold tracking-tight text-[var(--drixal-blue)] hover:underline">{{ service.company.name }}</NuxtLink>
        <p class="drixal-muted mt-3 leading-7">{{ service.company.description || t("serviceDetail.providerFallback") }}</p>

        <div class="mt-6 grid gap-3 text-sm font-bold text-[var(--drixal-ink)]">
          <div class="rounded-lg bg-[var(--drixal-soft)] p-4">
            {{ t("common.location") }}: {{ service.company.location.area }}{{ service.company.location.area && service.company.location.city ? ", " : "" }}{{ service.company.location.city }}
          </div>
          <div class="rounded-lg bg-[var(--drixal-soft)] p-4">
            {{ t("common.rating") }}: {{ service.company.rating || 0 }}/5
          </div>
        </div>

      </aside>
    </div>
  </section>
</template>