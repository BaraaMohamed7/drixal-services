<script setup lang="ts">
const { t } = useLocale();
const pending = ref(false);
const error = ref("");
const result = ref<{ company: { name: string; slug: string; status: "PENDING" }; owner: { email: string } }>();
const form = reactive({
  company: {
    name: "",
    slug: "",
    description: "",
    city: "",
    area: "",
  },
  owner: {
    name: "",
    email: "",
  },
});

const register = async () => {
  pending.value = true;
  error.value = "";
  try {
    result.value = await $fetch("/api/companies/register", { method: "POST", body: form });
  } catch (err) {
    error.value = err instanceof Error ? err.message : t("companyRegistration.error");
  } finally {
    pending.value = false;
  }
};
</script>

<template>
  <section class="mx-auto grid max-w-4xl gap-5 overflow-hidden pb-8">
    <NuxtLink to="/marketplace" class="drixal-link-pill w-fit rounded-full px-4 py-2 text-sm font-black">
      {{ t("common.backToMarketplace") }}
    </NuxtLink>

    <div class="carbon-card rounded-xl p-5">
      <p class="mb-2 text-xs font-black uppercase tracking-[0.2em] text-[var(--drixal-blue)]">{{ t("companyRegistration.eyebrow") }}</p>
      <h1 class="text-2xl font-semibold leading-8 tracking-tight">{{ t("companyRegistration.title") }}</h1>
      <p class="drixal-muted mt-2 max-w-2xl text-sm">{{ t("companyRegistration.description") }}</p>
    </div>

    <div v-if="result" class="drixal-panel rounded-xl p-6">
      <UBadge :label="t('statuses.PENDING')" color="warning" variant="soft" />
      <h2 class="mt-4 text-xl font-semibold">{{ t("companyRegistration.successTitle") }}</h2>
      <p class="drixal-muted mt-2">{{ t("companyRegistration.successDescription", { company: result.company.name }) }}</p>
      <p class="mt-4 text-sm font-semibold">{{ t("companyRegistration.demoHint", { email: result.owner.email }) }}</p>
      <UButton to="/marketplace" class="mt-5" :label="t('common.marketplace')" />
    </div>

    <form v-else class="carbon-card grid gap-5 rounded-xl p-5" @submit.prevent="register">
      <div>
        <h2 class="text-lg font-semibold">{{ t("companyRegistration.companySection") }}</h2>
        <p class="drixal-muted mt-1 text-sm">{{ t("companyRegistration.companySectionDescription") }}</p>
      </div>

      <div class="grid gap-4 md:grid-cols-2">
        <UFormField :label="t('companyRegistration.companyName')" required>
          <UInput v-model="form.company.name" required class="w-full" :placeholder="t('companyRegistration.companyNamePlaceholder')" />
        </UFormField>
        <UFormField :label="t('companyRegistration.slug')">
          <UInput v-model="form.company.slug" class="w-full" :placeholder="t('companyRegistration.slugPlaceholder')" />
        </UFormField>
        <UFormField :label="t('common.city')" required>
          <UInput v-model="form.company.city" required class="w-full" :placeholder="t('companyRegistration.cityPlaceholder')" />
        </UFormField>
        <UFormField :label="t('companyRegistration.area')">
          <UInput v-model="form.company.area" class="w-full" :placeholder="t('companyRegistration.areaPlaceholder')" />
        </UFormField>
        <UFormField :label="t('common.description')" class="md:col-span-2">
          <UTextarea v-model="form.company.description" class="w-full" :rows="4" :placeholder="t('companyRegistration.descriptionPlaceholder')" />
        </UFormField>
      </div>

      <div class="border-t border-[var(--drixal-line)] pt-5">
        <h2 class="text-lg font-semibold">{{ t("companyRegistration.ownerSection") }}</h2>
        <p class="drixal-muted mt-1 text-sm">{{ t("companyRegistration.ownerSectionDescription") }}</p>
      </div>

      <div class="grid gap-4 md:grid-cols-2">
        <UFormField :label="t('companyRegistration.ownerName')" required>
          <UInput v-model="form.owner.name" required class="w-full" :placeholder="t('companyRegistration.ownerNamePlaceholder')" />
        </UFormField>
        <UFormField :label="t('common.email')" required>
          <UInput v-model="form.owner.email" required type="email" class="w-full" :placeholder="t('companyRegistration.ownerEmailPlaceholder')" />
        </UFormField>
      </div>

      <p v-if="error" class="drixal-danger rounded-xl p-4 font-semibold">{{ error }}</p>
      <div class="flex justify-end">
        <UButton type="submit" :loading="pending" :label="t('companyRegistration.submit')" />
      </div>
    </form>
  </section>
</template>
