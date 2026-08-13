<script setup lang="ts">
type CustomerItem = {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  city?: string;
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
};

const route = useRoute();
const router = useRouter();
const { t } = useLocale();
const search = ref(typeof route.query.search === "string" ? route.query.search : "");
const query = computed(() => ({ search: search.value || undefined }));
const { data, pending, error } = await useFetch<{ items: CustomerItem[] }>("/api/customers", { query });
const customers = computed(() => data.value?.items || []);

watch(query, (value) => router.replace({ query: value }), { deep: true });
</script>

<template>
  <section class="grid gap-4 overflow-hidden pb-8">
    <div class="carbon-card rounded-xl p-5">
      <p class="mb-2 text-xs font-black uppercase tracking-[0.2em] text-[var(--drixal-blue)]">{{ t("customers.eyebrow") }}</p>
      <div class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 class="text-2xl font-semibold leading-8 tracking-tight">{{ t("customers.title") }}</h1>
          <p class="drixal-muted mt-2 max-w-2xl text-sm">{{ t("customers.description") }}</p>
        </div>
        <p class="drixal-muted text-sm font-bold">{{ t("customers.found", { count: customers.length }) }}</p>
      </div>
    </div>

    <div class="carbon-card rounded-xl p-3">
      <UInput v-model="search" class="max-w-xl" :placeholder="t('customers.searchPlaceholder')" />
    </div>

    <p v-if="error" class="drixal-danger rounded-xl p-4 font-semibold">{{ error.message }}</p>
    <p v-else-if="pending" class="drixal-panel rounded-xl p-6 text-center font-semibold drixal-muted">{{ t("customers.loading") }}</p>

    <div v-else-if="customers.length" class="table-scroll">
      <table class="business-table">
        <thead>
          <tr>
            <th>{{ t("common.customer") }}</th>
            <th>{{ t("common.phone") }}</th>
            <th>{{ t("common.email") }}</th>
            <th>{{ t("common.city") }}</th>
            <th>{{ t("common.status") }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="customer in customers" :key="customer._id">
            <td><div class="font-bold text-[var(--drixal-ink)]">{{ customer.name }}</div></td>
            <td>{{ customer.phone }}</td>
            <td>{{ customer.email || '-' }}</td>
            <td>{{ customer.city || '-' }}</td>
            <td><UBadge :label="t(`statuses.${customer.status}`)" :color="customer.status === 'ACTIVE' ? 'success' : 'neutral'" variant="soft" /></td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else class="drixal-panel rounded-xl border-dashed p-6 text-center">
      <h2 class="text-lg font-semibold">{{ t("customers.emptyTitle") }}</h2>
      <p class="drixal-muted mt-2">{{ t("customers.emptyDescription") }}</p>
    </div>
  </section>
</template>
