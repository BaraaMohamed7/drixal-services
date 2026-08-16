<script setup lang="ts">
type ServiceOrderLine = {
  _id?: string;
  title: string;
  quantity: number;
  assignedTo?: string;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  cost?: { amount?: number; currency?: string };
};

type ServiceOrderDetail = {
  _id: string;
  orderNumber: string;
  title: string;
  description?: string;
  status: "DRAFT" | "SCHEDULED" | "ASSIGNED" | "IN_PROGRESS" | "ON_HOLD" | "COMPLETED" | "CANCELLED";
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  scheduledDate?: string;
  assignedTo?: string;
  assignedUserId?: string;
  customerId?: { name: string; phone?: string; city?: string };
  serviceId?: { name: string };
  lines: ServiceOrderLine[];
};

type CompanyMember = {
  id: string;
  userId: string;
  name: string;
  role: string;
};

const route = useRoute();
const { t } = useLocale();
const { hasPermission } = useProviderSession();
const orderBase = computed(() => route.path.startsWith("/employee") ? "/employee/orders" : route.path.startsWith("/company-admin") ? "/company-admin/orders" : "/provider/orders");
const { data: order, pending, error, refresh } = await useFetch<ServiceOrderDetail>(`/api/service-orders/${route.params.id}`);
const linePending = ref(false);
const assignmentPending = ref("");
const orderAssignmentPending = ref(false);
const lineError = ref("");
const assignmentError = ref("");
const orderAssignmentError = ref("");
const members = ref<CompanyMember[]>([]);
const assignedUserId = ref("");

if (hasPermission("orders.manage")) {
  const { data: memberData } = await useFetch<{ items: CompanyMember[] }>("/api/company/members");
  members.value = memberData.value?.items || [];
}

watch(order, (value) => {
  if (value?.assignedUserId) assignedUserId.value = value.assignedUserId;
});

const assignOrder = async () => {
  if (!hasPermission("orders.manage")) return;
  orderAssignmentPending.value = true;
  orderAssignmentError.value = "";
  try {
    await $fetch(`/api/service-orders/${route.params.id}`, {
      method: "PATCH",
      body: { assignedUserId: assignedUserId.value },
    });
    await refresh();
  } catch (err) {
    orderAssignmentError.value = err instanceof Error ? err.message : t("serviceOrders.assignmentError");
  } finally {
    orderAssignmentPending.value = false;
  }
};
const lineForm = reactive({
  title: "",
  quantity: 1,
  assignedTo: "",
  cost: {
    amount: undefined as number | undefined,
    currency: "EGP",
  },
});

const lineStatusColor = (value: ServiceOrderLine["status"]) => ({
  PENDING: "neutral",
  IN_PROGRESS: "primary",
  COMPLETED: "success",
  CANCELLED: "error",
}[value]);

const orderStatusColor = (value: ServiceOrderDetail["status"]) => ({
  DRAFT: "neutral",
  SCHEDULED: "info",
  ASSIGNED: "primary",
  IN_PROGRESS: "primary",
  ON_HOLD: "warning",
  COMPLETED: "success",
  CANCELLED: "error",
}[value]);

const priorityColor = (value: ServiceOrderDetail["priority"]) => ({
  LOW: "neutral",
  MEDIUM: "info",
  HIGH: "warning",
  CRITICAL: "error",
}[value]);

const formatCost = (line: ServiceOrderLine) => {
  if (line.cost?.amount === undefined || line.cost.amount === null) return "-";
  return `${line.cost.amount} ${line.cost.currency || "EGP"}`;
};

const addLine = async () => {
  if (!hasPermission("orders.manage")) return;
  linePending.value = true;
  lineError.value = "";
  try {
    await $fetch(`/api/service-orders/${route.params.id}/lines`, { method: "POST", body: lineForm });
    lineForm.title = "";
    lineForm.quantity = 1;
    lineForm.assignedTo = "";
    lineForm.cost.amount = undefined;
    await refresh();
  } catch (err) {
    lineError.value = err instanceof Error ? err.message : t("serviceOrders.addLineError");
  } finally {
    linePending.value = false;
  }
};

const updateLineAssignment = async (line: ServiceOrderLine) => {
  if (!hasPermission("orders.manage")) return;
  if (!line._id) return;
  assignmentPending.value = line._id;
  assignmentError.value = "";
  try {
    await $fetch(`/api/service-orders/${route.params.id}/lines/${line._id}`, {
      method: "PATCH",
      body: { assignedTo: line.assignedTo, status: line.status },
    });
    await refresh();
  } catch (err) {
    assignmentError.value = err instanceof Error ? err.message : t("serviceOrders.assignmentError");
  } finally {
    assignmentPending.value = "";
  }
};
</script>

<template>
  <section class="grid gap-4 overflow-hidden pb-8">
    <NuxtLink :to="orderBase" class="drixal-link-pill w-fit rounded-full px-4 py-2 text-sm font-black">
      {{ t("common.orders") }}
    </NuxtLink>

    <p v-if="error" class="drixal-danger rounded-xl p-4 font-semibold">{{ error.message }}</p>
    <p v-else-if="pending" class="drixal-panel rounded-xl p-6 text-center font-semibold drixal-muted">{{ t("serviceOrders.loading") }}</p>

    <div v-else-if="order" class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
      <main class="grid min-w-0 gap-4">
        <div class="drixal-card p-5">
          <p class="mb-2 text-xs font-black uppercase tracking-[0.2em] text-[var(--drixal-blue)]">{{ t("serviceOrders.detailsTitle") }}</p>
          <div class="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <h1 class="text-2xl font-semibold leading-8 tracking-tight">{{ order.orderNumber }} - {{ order.title }}</h1>
              <p class="drixal-muted mt-2 max-w-2xl text-sm">{{ order.description || t("serviceOrders.description") }}</p>
            </div>
            <div class="flex flex-wrap gap-2">
              <UBadge :label="t(`statuses.${order.status}`)" :color="orderStatusColor(order.status)" variant="soft" />
              <UBadge :label="t(`statuses.${order.priority}`)" :color="priorityColor(order.priority)" variant="soft" />
            </div>
          </div>
        </div>

        <div class="drixal-card p-4">
          <div class="mb-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <h2 class="text-lg font-semibold">{{ t("serviceOrders.serviceLines") }}</h2>
          </div>

          <div class="table-scroll">
            <table class="business-table">
              <thead>
                <tr>
                  <th>{{ t("common.title") }}</th>
                  <th>{{ t("common.quantity") }}</th>
                  <th>{{ t("common.assignedTo") }}</th>
                  <th>{{ t("common.status") }}</th>
                  <th>{{ t("common.cost") }}</th>
                  <th>{{ t("common.actions") }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="line in order.lines" :key="line._id || line.title">
                  <td><div class="font-bold text-[var(--drixal-ink)]">{{ line.title }}</div></td>
                  <td>{{ line.quantity }}</td>
                   <td><UInput v-if="hasPermission('orders.manage')" v-model="line.assignedTo" size="sm" :placeholder="t('serviceOrders.assignedPlaceholder')" /><span v-else>{{ line.assignedTo || '-' }}</span></td>
                  <td><UBadge :label="t(`statuses.${line.status}`)" :color="lineStatusColor(line.status)" variant="soft" /></td>
                  <td>{{ formatCost(line) }}</td>
                   <td><UButton v-if="hasPermission('orders.manage')" :label="t('common.assign')" size="sm" color="neutral" variant="outline" :loading="assignmentPending === line._id" @click="updateLineAssignment(line)" /><span v-else class="drixal-muted text-xs font-semibold">{{ t("permissions.readOnly") }}</span></td>
                </tr>
              </tbody>
            </table>
          </div>

           <form v-if="hasPermission('orders.manage')" class="mt-4 grid gap-3 border-t border-[var(--drixal-line)] pt-4 md:grid-cols-[minmax(0,1.5fr)_120px_minmax(0,1fr)_120px_auto]" @submit.prevent="addLine">
            <UInput v-model="lineForm.title" required :placeholder="t('serviceOrders.lineTitlePlaceholder')" />
            <UInput v-model.number="lineForm.quantity" required type="number" min="1" :placeholder="t('common.quantity')" />
            <UInput v-model="lineForm.assignedTo" :placeholder="t('serviceOrders.assignedPlaceholder')" />
            <UInput v-model.number="lineForm.cost.amount" type="number" min="0" :placeholder="t('serviceOrders.costPlaceholder')" />
            <UButton type="submit" :loading="linePending" :label="t('common.addLine')" />
          </form>
          <p v-if="lineError" class="drixal-danger mt-3 rounded-xl p-3 text-sm font-bold">{{ lineError }}</p>
          <p v-if="assignmentError" class="drixal-danger mt-3 rounded-xl p-3 text-sm font-bold">{{ assignmentError }}</p>
        </div>
      </main>

      <aside class="drixal-panel h-fit rounded-xl p-5">
        <h2 class="text-lg font-semibold">{{ t("serviceOrders.summary") }}</h2>
        <dl class="mt-4 grid gap-3 text-sm">
          <div>
            <dt class="drixal-muted font-bold">{{ t("common.customer") }}</dt>
            <dd class="mt-1 font-semibold">{{ order.customerId?.name || '-' }}</dd>
          </div>
          <div>
            <dt class="drixal-muted font-bold">{{ t("common.phone") }}</dt>
            <dd class="mt-1 font-semibold">{{ order.customerId?.phone || '-' }}</dd>
          </div>
          <div>
            <dt class="drixal-muted font-bold">{{ t("common.service") }}</dt>
            <dd class="mt-1 font-semibold">{{ order.serviceId?.name || '-' }}</dd>
          </div>
          <div>
            <dt class="drixal-muted font-bold">{{ t("common.assignedTo") }}</dt>
            <dd class="mt-1 font-semibold">{{ order.assignedTo || '-' }}</dd>
          </div>
          <div v-if="hasPermission('orders.manage')">
            <dt class="drixal-muted font-bold">{{ t("common.assign") }}</dt>
            <dd class="mt-1 flex flex-col gap-2">
              <USelect
                v-model="assignedUserId"
                :items="[{ label: t('common.unassigned'), value: '' }, ...members.map((member) => ({ label: `${member.name} (${member.role})`, value: member.userId }))]"
                size="sm"
              />
              <UButton :label="t('common.saveChanges')" size="sm" color="neutral" variant="outline" :loading="orderAssignmentPending" @click="assignOrder" />
              <p v-if="orderAssignmentError" class="drixal-danger text-xs font-bold">{{ orderAssignmentError }}</p>
            </dd>
          </div>
          <div>
            <dt class="drixal-muted font-bold">{{ t("common.scheduledDate") }}</dt>
            <dd class="mt-1 font-semibold">{{ order.scheduledDate ? new Date(order.scheduledDate).toLocaleDateString() : '-' }}</dd>
          </div>
        </dl>
      </aside>
    </div>
  </section>
</template>
