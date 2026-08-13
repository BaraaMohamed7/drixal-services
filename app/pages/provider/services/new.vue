<script setup lang="ts">
import ServiceForm from "~/components/ServiceForm.vue";

type Category = {
  _id: string;
  name: string;
  slug: string;
};

const router = useRouter();
const route = useRoute();
const { t } = useLocale();
const { hasPermission } = useProviderSession();
const serviceBase = computed(() => route.path.startsWith("/company-admin") ? "/company-admin/services" : "/provider/services");
const pending = ref(false);
const error = ref("");
const { data: categoriesData } = await useFetch<{ items: Category[] }>("/api/categories");
const categories = computed(() => categoriesData.value?.items || []);

const createService = async (value: unknown) => {
  if (!hasPermission("services.manage")) return;
  pending.value = true;
  error.value = "";

  try {
    await $fetch("/api/services", {
      method: "POST",
      body: value,
    });
    await router.push(serviceBase.value);
  } catch (err) {
    error.value = err instanceof Error ? err.message : t("newService.error");
  } finally {
    pending.value = false;
  }
};
</script>

<template>
  <section class="mx-auto grid max-w-3xl gap-5 overflow-hidden px-4 py-5 sm:px-6">
    <NuxtLink :to="serviceBase" class="drixal-link-pill w-fit rounded-full px-4 py-2 text-sm font-black">
      {{ t("common.backToServices") }}
    </NuxtLink>

    <div>
      <p class="drixal-muted mb-2 text-xs font-black uppercase tracking-[0.2em]">{{ t("newService.eyebrow") }}</p>
      <h1 class="text-2xl font-semibold leading-8 tracking-tight">{{ t("newService.title") }}</h1>
      <p class="drixal-muted mt-3 max-w-2xl">{{ t("newService.description") }}</p>
    </div>

    <p v-if="error" class="drixal-danger rounded-xl p-4 font-semibold">{{ error }}</p>

    <ServiceForm :categories="categories" :submit-label="t('newService.submit')" :pending="pending" @submit="createService" />
  </section>
</template>
