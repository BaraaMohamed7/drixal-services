<script setup lang="ts">
type CompanyItem = {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  status: "SETUP" | "ACTIVE" | "SUSPENDED";
  location: { city?: string; area?: string };
  createdAt: string;
};

const { t } = useLocale();
const allOptionValue = "__all__";
const search = ref("");
const status = ref(allOptionValue);
const page = ref(1);
const actionPending = ref("");
const actionError = ref("");
const confirm = useConfirm();
const query = computed(() => ({ search: search.value || undefined, status: status.value === allOptionValue ? undefined : status.value, page: page.value > 1 ? page.value : undefined }));
const { data, pending, error, refresh } = await useFetch<{ items: CompanyItem[]; pagination: { page: number; pages: number; total: number } }>("/api/admin/companies", { query });
const companies = computed(() => data.value?.items || []);
const pagination = computed(() => data.value?.pagination || { page: 1, pages: 1, total: 0 });
watch([search, status], () => {
  page.value = 1;
});
const statusOptions = computed(() => [
  { label: t("common.allStatuses"), value: allOptionValue },
  { label: t("statuses.SETUP"), value: "SETUP" },
  { label: t("statuses.ACTIVE"), value: "ACTIVE" },
  { label: t("statuses.SUSPENDED"), value: "SUSPENDED" },
]);

const statusColor = (value: CompanyItem["status"]) => ({
  SETUP: "warning",
  ACTIVE: "success",
  SUSPENDED: "error",
}[value]);

const updateStatus = async (company: CompanyItem, nextStatus: "ACTIVE" | "SUSPENDED") => {
  if (nextStatus === "SUSPENDED") {
    const confirmed = await confirm.open({
      title: t("confirm.suspendCompany"),
      description: t("confirm.suspendCompanyDescription"),
      cancelLabel: t("confirm.cancel"),
      confirmLabel: t("confirm.accept"),
    });
    if (!confirmed) return;
  }
  actionPending.value = `${company._id}:${nextStatus}`;
  actionError.value = "";
  try {
    await $fetch(`/api/admin/companies/${company._id}`, { method: "PATCH", body: { status: nextStatus } });
    await refresh();
  } catch (err) {
    actionError.value = err instanceof Error ? err.message : t("companyAdmin.actionError");
  } finally {
    actionPending.value = "";
  }
};
</script>

<template>
  <section class="grid gap-4 overflow-hidden pb-8">
    <header class="page-header">
      <div class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 class="page-title">{{ t("companyAdmin.title") }}</h1>
          <p class="drixal-muted mt-2 max-w-2xl text-sm">{{ t("companyAdmin.description") }}</p>
        </div>
        <p class="drixal-muted text-sm font-bold">{{ t("companyAdmin.found", { count: companies.length }) }}</p>
      </div>
    </header>

    <div class="drixal-card flex flex-col gap-3 p-3 md:flex-row">
      <UInput v-model="search" class="min-w-0 flex-1" :placeholder="t('companyAdmin.searchPlaceholder')" />
      <USelect v-model="status" :items="statusOptions" label-key="label" value-key="value" class="min-w-0 md:w-56" />
    </div>

    <p v-if="actionError" class="drixal-danger rounded-xl p-4 font-semibold">{{ actionError }}</p>
    <p v-if="error" class="drixal-danger rounded-xl p-4 font-semibold">{{ error.message }}</p>
    <p v-else-if="pending" class="drixal-panel rounded-xl p-6 text-center font-semibold drixal-muted">{{ t("companyAdmin.loading") }}</p>

    <div v-else-if="companies.length">
      <div class="table-scroll">
      <table class="business-table">
        <thead><tr><th>{{ t("common.company") }}</th><th>{{ t("common.location") }}</th><th>{{ t("common.status") }}</th><th>{{ t("companyAdmin.registered") }}</th><th>{{ t("common.actions") }}</th></tr></thead>
        <tbody>
          <tr v-for="company in companies" :key="company._id">
            <td><div class="font-bold text-[var(--drixal-ink)]">{{ company.name }}</div><div class="drixal-muted mt-1 text-xs">{{ company.slug }}</div></td>
            <td>{{ [company.location.area, company.location.city].filter(Boolean).join(', ') || '-' }}</td>
            <td><UBadge :label="t(`statuses.${company.status}`)" :color="statusColor(company.status)" variant="soft" /></td>
            <td>{{ new Date(company.createdAt).toLocaleDateString() }}</td>
            <td>
              <div class="flex flex-wrap gap-2">
                <UButton v-if="company.status !== 'ACTIVE'" :label="t('common.approve')" size="sm" :loading="actionPending === `${company._id}:ACTIVE`" @click="updateStatus(company, 'ACTIVE')" />
                <UButton v-if="company.status === 'ACTIVE'" :label="t('companyAdmin.suspend')" size="sm" color="error" variant="soft" :loading="actionPending === `${company._id}:SUSPENDED`" @click="updateStatus(company, 'SUSPENDED')" />
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      </div>

      <div class="pt-3">
        <PaginationBar :page="pagination.page" :pages="pagination.pages" :total="pagination.total" @update-page="page = $event" />
      </div>
    </div>

    <div v-else class="drixal-panel rounded-xl border-dashed p-6 text-center">
      <h2 class="text-lg font-semibold">{{ t("companyAdmin.emptyTitle") }}</h2>
      <p class="drixal-muted mt-2">{{ t("companyAdmin.emptyDescription") }}</p>
    </div>
  </section>
</template>
