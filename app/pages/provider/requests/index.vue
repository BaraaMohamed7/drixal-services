<script setup lang="ts">
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
const { t } = useLocale();
const query = computed(() => ({ status: status.value === allOptionValue ? undefined : status.value }));
const { data, pending, error, refresh } = await useFetch<{ items: ProviderRequest[] }>("/api/service-requests", { query });
const requests = computed(() => data.value?.items || []);
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
    <div class="carbon-card rounded-xl p-5">
      <p class="drixal-muted mb-2 text-xs font-black uppercase tracking-[0.2em]">{{ t("providerRequests.eyebrow") }}</p>
      <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 class="text-2xl font-semibold leading-8 tracking-tight">{{ t("providerRequests.title") }}</h1>
          <p class="drixal-muted mt-2 max-w-2xl">{{ t("providerRequests.description") }}</p>
        </div>
        <USelect v-model="status" :items="statusOptions" label-key="label" value-key="value" class="min-w-56" />
      </div>
    </div>

    <p v-if="error" class="drixal-danger rounded-xl p-4 font-semibold">{{ error.message }}</p>
    <p v-else-if="pending" class="drixal-panel rounded-xl p-6 text-center font-semibold drixal-muted">{{ t("providerRequests.loading") }}</p>

    <div v-else-if="requests.length" class="table-scroll">
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
                <UButton v-if="!['APPROVED', 'REJECTED', 'CONVERTED', 'CANCELLED'].includes(request.status)" :label="t('common.approve')" size="sm" variant="soft" :loading="actionPending === `${request._id}:approve`" @click="runAction(request, 'approve')" />
                <UButton v-if="!['REJECTED', 'CONVERTED', 'CANCELLED'].includes(request.status)" :label="t('common.reject')" size="sm" color="error" variant="soft" :loading="actionPending === `${request._id}:reject`" @click="runAction(request, 'reject')" />
                <UButton v-if="request.status === 'APPROVED'" :label="t('common.convertToOrder')" size="sm" color="primary" :loading="actionPending === `${request._id}:convert`" @click="runAction(request, 'convert')" />
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else class="drixal-panel rounded-xl border-dashed p-6 text-center">
      <h2 class="text-xl font-black">{{ t("providerRequests.emptyTitle") }}</h2>
      <p class="drixal-muted mt-2">{{ t("providerRequests.emptyDescription") }}</p>
    </div>
  </section>
</template>
