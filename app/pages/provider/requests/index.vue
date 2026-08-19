<script setup lang="ts">
definePageMeta({ layout: "workspace" });
type ProviderRequest = {
  _id: string;
  customer: {
    name: string;
    phone: string;
    email?: string;
    city?: string;
  };
  message: string;
  preferredDate?: string;
  status: "NEW" | "UNDER_REVIEW" | "APPROVED" | "REJECTED" | "CONVERTED" | "CANCELLED" | "CONTACTED" | "CLOSED";
  createdAt: string;
  serviceId?: {
    name: string;
    slug: string;
  };
};

const allOptionValue = "__all__";
const status = ref(allOptionValue);
const page = ref(1);
const { t } = useLocale();
const { hasPermission } = useProviderSession();
const confirm = useConfirm();
const query = computed(() => ({ status: status.value === allOptionValue ? undefined : status.value, page: page.value > 1 ? page.value : undefined }));
const { data, pending, error, refresh } = await useFetch<{ items: ProviderRequest[]; pagination: { page: number; pages: number; total: number } }>("/api/service-requests", { query });
const requests = computed(() => data.value?.items || []);
const pagination = computed(() => data.value?.pagination || { page: 1, pages: 1, total: 0 });
watch(status, () => {
  page.value = 1;
});
const actionPending = ref("");
const statusOptions = computed(() => [
  { label: t("common.allStatuses"), value: allOptionValue },
  { label: t("statuses.NEW"), value: "NEW" },
  { label: t("statuses.UNDER_REVIEW"), value: "UNDER_REVIEW" },
  { label: t("statuses.APPROVED"), value: "APPROVED" },
  { label: t("statuses.REJECTED"), value: "REJECTED" },
  { label: t("statuses.CONVERTED"), value: "CONVERTED" },
  { label: t("statuses.CANCELLED"), value: "CANCELLED" },
]);

const requestStatusSeverity = (value: ProviderRequest["status"]) => ({
  NEW: "primary",
  UNDER_REVIEW: "info",
  APPROVED: "success",
  REJECTED: "error",
  CONVERTED: "success",
  CANCELLED: "neutral",
  CONTACTED: "warning",
  CLOSED: "neutral",
}[value]);

const runAction = async (request: ProviderRequest, action: "approve" | "reject" | "convert") => {
  const permission = action === "convert" ? "requests.convert" : "requests.update_status";
  if (!hasPermission(permission)) return;
  if (action === "reject") {
    const confirmed = await confirm.open({
      title: t("confirm.rejectRequest"),
      description: t("confirm.rejectRequestDescription"),
      cancelLabel: t("confirm.cancel"),
      confirmLabel: t("confirm.accept"),
    });
    if (!confirmed) return;
  }
  actionPending.value = `${request._id}:${action}`;
  try {
    await $fetch(`/api/service-requests/${request._id}/${action}`, { method: "POST" });
    await refresh();
  } finally {
    actionPending.value = "";
  }
};
</script>

<template>
  <section class="grid gap-4 overflow-hidden pb-8">
    <header class="page-header">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 class="page-title">{{ t("providerRequests.title") }}</h1>
          <p class="drixal-muted mt-2 max-w-2xl">{{ t("providerRequests.description") }}</p>
        </div>
        <USelect v-model="status" :items="statusOptions" label-key="label" value-key="value" class="min-w-56" />
      </div>
    </header>

    <p v-if="error" class="drixal-danger rounded-xl p-4 font-semibold">{{ error.message }}</p>
    <p v-else-if="pending" class="drixal-panel rounded-xl p-6 text-center font-semibold drixal-muted">{{ t("providerRequests.loading") }}</p>

    <div v-else-if="requests.length">
      <div class="table-scroll">
      <table class="business-table">
        <thead>
          <tr>
            <th>{{ t("common.status") }}</th>
            <th>{{ t("common.service") }}</th>
            <th>{{ t("requestForm.namePlaceholder") }}</th>
            <th>{{ t("requestForm.messagePlaceholder") }}</th>
            <th>{{ t("common.city") }}</th>
            <th>{{ t("providerRequests.preferred") }}</th>
            <th>{{ t("common.actions") }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="request in requests" :key="request._id">
            <td><UBadge :label="t(`statuses.${request.status}`)" :color="requestStatusSeverity(request.status)" variant="soft" /></td>
            <td>{{ request.serviceId?.name || t("common.service") }}</td>
            <td>
              <div class="font-bold">{{ request.customer.name }}</div>
              <div class="drixal-muted text-xs">{{ request.customer.phone }}</div>
            </td>
            <td><span class="line-clamp-2">{{ request.message }}</span></td>
            <td>{{ request.customer.city || '-' }}</td>
            <td>{{ request.preferredDate ? new Date(request.preferredDate).toLocaleDateString() : '-' }}</td>
            <td>
              <div class="flex flex-wrap gap-2">
                 <UButton v-if="hasPermission('requests.update_status') && !['APPROVED', 'REJECTED', 'CONVERTED', 'CANCELLED'].includes(request.status)" :label="t('common.approve')" size="sm" variant="soft" :loading="actionPending === `${request._id}:approve`" @click="runAction(request, 'approve')" />
                 <UButton v-if="hasPermission('requests.update_status') && !['REJECTED', 'CONVERTED', 'CANCELLED'].includes(request.status)" :label="t('common.reject')" size="sm" color="error" variant="soft" :loading="actionPending === `${request._id}:reject`" @click="runAction(request, 'reject')" />
                 <UButton v-if="hasPermission('requests.convert') && request.status === 'APPROVED'" :label="t('common.convertToOrder')" size="sm" color="primary" :loading="actionPending === `${request._id}:convert`" @click="runAction(request, 'convert')" />
                 <span v-if="!hasPermission('requests.update_status') && !hasPermission('requests.convert')" class="drixal-muted text-xs font-semibold">{{ t("permissions.readOnly") }}</span>
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
      <h2 class="text-xl font-black">{{ t("providerRequests.emptyTitle") }}</h2>
      <p class="drixal-muted mt-2">{{ t("providerRequests.emptyDescription") }}</p>
    </div>
  </section>
</template>
