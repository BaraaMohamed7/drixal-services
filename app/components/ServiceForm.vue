<script setup lang="ts">
type Category = {
  _id: string;
  name: string;
  slug: string;
};

type ServiceFormValue = {
  name: string;
  description: string;
  categoryId: string;
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
  operationalStatus?: "ACTIVE" | "INACTIVE";
};

const props = defineProps<{
  categories: Category[];
  initialValue?: Partial<ServiceFormValue>;
  submitLabel: string;
  pending?: boolean;
}>();

const { t } = useLocale();
const categoryOptions = computed(() => props.categories);
const locationOptions = computed(() => [
  { label: t("serviceForm.providerLocation"), value: "PROVIDER" },
  { label: t("serviceForm.customerLocation"), value: "CUSTOMER" },
  { label: t("serviceForm.remote"), value: "REMOTE" },
  { label: t("serviceForm.flexible"), value: "FLEXIBLE" },
]);
const pricingOptions = computed(() => [
  { label: t("serviceForm.fixed"), value: "FIXED" },
  { label: t("serviceForm.hourly"), value: "HOURLY" },
  { label: t("serviceForm.customQuote"), value: "CUSTOM" },
]);
const operationalOptions = computed(() => [
  { label: t("common.active"), value: "ACTIVE" },
  { label: t("common.inactive"), value: "INACTIVE" },
]);

const emit = defineEmits<{
  submit: [value: ServiceFormValue];
}>();

const form = reactive<ServiceFormValue>({
  name: props.initialValue?.name || "",
  description: props.initialValue?.description || "",
  categoryId: props.initialValue?.categoryId || props.categories[0]?._id || "",
  pricing: {
    type: props.initialValue?.pricing?.type || "FIXED",
    amount: props.initialValue?.pricing?.amount,
    currency: props.initialValue?.pricing?.currency || "EGP",
  },
  duration: props.initialValue?.duration,
  locationType: props.initialValue?.locationType || "FLEXIBLE",
  scheduling: {
    required: props.initialValue?.scheduling?.required || false,
  },
  operationalStatus: props.initialValue?.operationalStatus || "ACTIVE",
});

watch(
  () => props.categories,
  (categories) => {
    if (!form.categoryId && categories[0]?._id) form.categoryId = categories[0]._id;
  },
);

const submit = () => {
  emit("submit", {
    ...form,
    pricing: {
      ...form.pricing,
      amount: form.pricing.type === "CUSTOM" ? undefined : Number(form.pricing.amount),
    },
    duration: form.duration === undefined || form.duration === null ? undefined : Number(form.duration),
  });
};
</script>

<template>
  <form class="carbon-card grid gap-4 rounded-xl p-4 sm:p-5" @submit.prevent="submit">
    <div class="grid gap-2">
      <label class="text-sm font-bold text-[var(--drixal-ink)]" for="name">{{ t("serviceForm.serviceName") }}</label>
      <UInput id="name" v-model="form.name" required class="min-w-0" :placeholder="t('serviceForm.serviceNamePlaceholder')" />
    </div>

    <div class="grid gap-2">
      <label class="text-sm font-bold text-[var(--drixal-ink)]" for="description">{{ t("serviceForm.description") }}</label>
      <UTextarea id="description" v-model="form.description" required :rows="4" class="min-w-0" :placeholder="t('serviceForm.descriptionPlaceholder')" />
    </div>

    <div class="grid gap-4 md:grid-cols-2">
      <div class="grid gap-2">
        <label class="text-sm font-bold text-[var(--drixal-ink)]" for="category">{{ t("serviceForm.category") }}</label>
        <USelect id="category" v-model="form.categoryId" :items="categoryOptions" label-key="name" value-key="_id" class="min-w-0" />
      </div>

      <div class="grid gap-2">
        <label class="text-sm font-bold text-[var(--drixal-ink)]" for="locationType">{{ t("serviceForm.locationType") }}</label>
        <USelect id="locationType" v-model="form.locationType" :items="locationOptions" label-key="label" value-key="value" class="min-w-0" />
      </div>
    </div>

    <div class="grid gap-4 md:grid-cols-3">
      <div class="grid gap-2">
        <label class="text-sm font-bold text-[var(--drixal-ink)]" for="pricingType">{{ t("serviceForm.pricingType") }}</label>
        <USelect id="pricingType" v-model="form.pricing.type" :items="pricingOptions" label-key="label" value-key="value" class="min-w-0" />
      </div>

      <div class="grid gap-2">
        <label class="text-sm font-bold text-[var(--drixal-ink)]" for="amount">{{ t("common.price") }}</label>
        <UInput id="amount" v-model.number="form.pricing.amount" :disabled="form.pricing.type === 'CUSTOM'" :required="form.pricing.type !== 'CUSTOM'" type="number" min="0" class="min-w-0" :placeholder="t('serviceForm.pricePlaceholder')" />
      </div>

      <div class="grid gap-2">
        <label class="text-sm font-bold text-[var(--drixal-ink)]" for="duration">{{ t("serviceForm.durationMinutes") }}</label>
        <UInput id="duration" v-model.number="form.duration" type="number" min="0" class="min-w-0" :placeholder="t('serviceForm.durationPlaceholder')" />
      </div>
    </div>

    <div class="flex flex-wrap items-center justify-between gap-4 rounded-lg bg-[var(--drixal-soft)] p-4">
      <label class="flex items-center gap-3 text-sm font-bold text-[var(--drixal-ink)]">
        <UCheckbox v-model="form.scheduling.required" />
        {{ t("serviceForm.requiresScheduling") }}
      </label>

      <label class="flex items-center gap-3 text-sm font-bold text-[var(--drixal-ink)]">
        {{ t("serviceForm.operationalStatus") }}
        <USelect v-model="form.operationalStatus" :items="operationalOptions" label-key="label" value-key="value" size="sm" />
      </label>
    </div>

    <UButton type="submit" :disabled="pending" :label="pending ? t('serviceForm.saving') : submitLabel" />
  </form>
</template>
