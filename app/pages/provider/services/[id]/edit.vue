<script setup lang="ts">
import ServiceForm from "~/components/ServiceForm.vue";
definePageMeta({ layout: "workspace" });

type Category = {
  _id: string;
  name: string;
  slug: string;
};

type ServiceDetail = {
  _id: string;
  name: string;
  description: string;
  categoryId: string | Category;
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
  operationalStatus: "ACTIVE" | "INACTIVE";
  publicationStatus: "DRAFT" | "PUBLISHED" | "UNPUBLISHED";
};

const route = useRoute();
const router = useRouter();
const { t } = useLocale();
const { hasPermission } = useProviderSession();
const serviceBase = computed(() => route.path.startsWith("/company-admin") ? "/company-admin/services" : "/provider/services");
const pending = ref(false);
const error = ref("");

const [{ data: categoriesData }, { data: serviceData, refresh }] = await Promise.all([
  useFetch<{ items: Category[] }>("/api/categories"),
  useFetch<ServiceDetail>(`/api/services/${route.params.id}`),
]);

const categories = computed(() => categoriesData.value?.items || []);
const service = computed(() => serviceData.value);
const initialValue = computed(() => {
  const value = service.value;
  if (!value) return undefined;

  return {
    ...value,
    categoryId: typeof value.categoryId === "string" ? value.categoryId : value.categoryId._id,
  };
});

const updateService = async (value: unknown) => {
  if (!hasPermission("services.update")) return;
  pending.value = true;
  error.value = "";

  try {
    await $fetch(`/api/services/${route.params.id}`, {
      method: "PATCH",
      body: value,
    });
    await refresh();
    await router.push(serviceBase.value);
  } catch (err) {
    error.value = err instanceof Error ? err.message : t("editService.error");
  } finally {
    pending.value = false;
  }
};

const publish = async () => {
  if (!hasPermission("services.publish")) return;
  await $fetch(`/api/services/${route.params.id}/publish`, { method: "POST" });
  await refresh();
};

const unpublish = async () => {
  if (!hasPermission("services.publish")) return;
  await $fetch(`/api/services/${route.params.id}/unpublish`, { method: "POST" });
  await refresh();
};
</script>

<template>
  <section class="mx-auto grid max-w-3xl gap-5 overflow-hidden px-4 py-5 sm:px-6">
    <NuxtLink :to="serviceBase" class="drixal-link-pill w-fit rounded-full px-4 py-2 text-sm font-black">
      {{ t("common.backToServices") }}
    </NuxtLink>

    <div class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div class="min-w-0">
        <p class="drixal-muted mb-2 text-xs font-black uppercase tracking-[0.2em]">{{ t("editService.eyebrow") }}</p>
        <h1 class="break-words text-2xl font-semibold leading-8 tracking-tight">{{ service?.name || t("editService.fallbackTitle") }}</h1>
        <p class="drixal-muted mt-3">{{ t("common.status") }}: {{ service ? t(`statuses.${service.publicationStatus}`) : "" }}</p>
      </div>

      <div v-if="service && hasPermission('services.publish')" class="flex flex-wrap gap-2">
        <UButton v-if="service.publicationStatus !== 'PUBLISHED'" :label="t('common.publish')" @click="publish" />
        <UButton v-else :label="t('common.unpublish')" color="neutral" variant="soft" @click="unpublish" />
      </div>
    </div>

    <p v-if="error" class="drixal-danger rounded-xl p-4 font-semibold">{{ error }}</p>

    <ServiceForm v-if="initialValue" :categories="categories" :initial-value="initialValue" :submit-label="t('common.saveChanges')" :pending="pending" @submit="updateService" />
    <p v-else class="drixal-panel rounded-xl p-6 text-center font-semibold drixal-muted">{{ t("editService.loading") }}</p>
  </section>
</template>
