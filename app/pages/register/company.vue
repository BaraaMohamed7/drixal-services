<script setup lang="ts">
definePageMeta({ layout: "public" });

const { t } = useLocale();
const auth = useAuth();
const pending = ref(false);
const error = ref("");
const result = ref<{ company: { name: string; slug: string; status: "SETUP" } }>();
const form = reactive({
  company: {
    name: "",
    slug: "",
    description: "",
    city: "",
    area: "",
  },
});

const register = async () => {
  pending.value = true;
  error.value = "";
  try {
    result.value = await $fetch("/api/companies/register", { method: "POST", body: form });
    await auth.load(true);
  } catch (err) {
    error.value = err instanceof Error ? err.message : t("companyRegistration.error");
  } finally {
    pending.value = false;
  }
};

const returnToPersonal = async () => {
  await navigateTo("/customer");
};
</script>

<template>
  <section class="mx-auto grid max-w-5xl gap-5 overflow-hidden pb-8">
    <div>
      <button type="button" class="inline-flex items-center gap-2 text-sm font-semibold text-[var(--drixal-blue)] hover:underline" @click="returnToPersonal">
        <UIcon name="i-lucide-arrow-left" class="size-4 rtl:rotate-180" />
        {{ t("companyRegistration.backToPersonal") }}
      </button>
      <h1 class="mt-5 text-2xl font-semibold leading-8 tracking-tight">{{ t("companyRegistration.title") }}</h1>
      <p class="drixal-muted mt-2 max-w-2xl text-sm leading-6">{{ t("companyRegistration.description") }}</p>
    </div>

    <div v-if="result" class="drixal-panel p-6 sm:p-8" role="status">
      <div class="flex size-10 items-center justify-center rounded-lg bg-[var(--color-warning-bg)] text-[var(--color-warning-text)]">
        <UIcon name="i-lucide-clock-3" class="size-5" />
      </div>
      <UBadge class="mt-5" :label="t('statuses.SETUP')" color="warning" variant="soft" />
      <h2 class="mt-3 text-xl font-semibold">{{ t("companyRegistration.successTitle") }}</h2>
      <p class="drixal-muted mt-2 max-w-2xl">{{ t("companyRegistration.successDescription", { company: result.company.name }) }}</p>
      <div class="mt-6 flex flex-wrap gap-2">
        <UButton to="/company-admin" :label="t('companyRegistration.openCompany')" icon="i-lucide-building-2" />
        <UButton :label="t('companyRegistration.returnToPersonal')" color="neutral" variant="outline" @click="returnToPersonal" />
      </div>
    </div>

    <div v-else class="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_18rem]">
      <form class="drixal-card grid gap-6 p-5 sm:p-6" @submit.prevent="register">
        <div>
          <h2 class="text-lg font-semibold">{{ t("companyRegistration.companySection") }}</h2>
          <p class="drixal-muted mt-1 text-sm">{{ t("companyRegistration.companySectionDescription") }}</p>
        </div>

        <div class="grid gap-4 md:grid-cols-2">
          <UFormField :label="t('companyRegistration.companyName')" required>
            <UInput v-model="form.company.name" required autocomplete="organization" class="w-full" :placeholder="t('companyRegistration.companyNamePlaceholder')" />
          </UFormField>
          <UFormField :label="t('companyRegistration.slug')" :description="t('companyRegistration.slugDescription')">
            <UInput v-model="form.company.slug" dir="ltr" class="w-full" :placeholder="t('companyRegistration.slugPlaceholder')" />
          </UFormField>
          <UFormField :label="t('common.city')" required>
            <UInput v-model="form.company.city" required autocomplete="address-level2" class="w-full" :placeholder="t('companyRegistration.cityPlaceholder')" />
          </UFormField>
          <UFormField :label="t('companyRegistration.area')">
            <UInput v-model="form.company.area" autocomplete="address-level3" class="w-full" :placeholder="t('companyRegistration.areaPlaceholder')" />
          </UFormField>
          <UFormField :label="t('common.description')" :description="t('companyRegistration.descriptionHint')" class="md:col-span-2">
            <UTextarea v-model="form.company.description" class="w-full" :rows="5" :placeholder="t('companyRegistration.descriptionPlaceholder')" />
          </UFormField>
        </div>

        <p v-if="error" class="drixal-danger p-4 text-sm font-semibold" role="alert">{{ error }}</p>
        <div class="flex flex-col-reverse items-stretch justify-end gap-2 sm:flex-row sm:items-center">
          <UButton :label="t('common.cancel')" color="neutral" variant="ghost" @click="returnToPersonal" />
          <UButton type="submit" :loading="pending" :disabled="pending" :label="t('companyRegistration.submit')" />
        </div>
      </form>

      <aside class="operation-panel" :aria-label="t('companyRegistration.nextTitle')">
        <div class="panel-header"><h2 class="panel-title">{{ t("companyRegistration.nextTitle") }}</h2></div>
        <ol class="grid">
          <li v-for="(step, index) in [t('companyRegistration.nextReview'), t('companyRegistration.nextPrepare'), t('companyRegistration.nextPublish')]" :key="step" class="grid grid-cols-[2rem_1fr] gap-3 border-b border-[var(--drixal-line)] p-4 last:border-b-0">
            <span class="grid size-7 place-items-center rounded-md bg-[var(--drixal-soft-strong)] text-xs font-bold text-[var(--drixal-blue)]">{{ index + 1 }}</span>
            <p class="text-sm leading-6">{{ step }}</p>
          </li>
        </ol>
      </aside>
    </div>
  </section>
</template>
