<script setup lang="ts">
const props = defineProps<{
  page: number;
  pages: number;
  total: number;
}>();
const emit = defineEmits<{ updatePage: [value: number] }>();
const { t } = useLocale();

const pageSize = computed(() => (props.pages > 0 ? Math.ceil(props.total / props.pages) : Math.max(props.total, 1)));
const from = computed(() => (props.total === 0 ? 0 : (props.page - 1) * pageSize.value + 1));
const to = computed(() => Math.min(props.page * pageSize.value, props.total));

const go = (next: number) => {
  if (next >= 1 && next <= props.pages && next !== props.page) emit("updatePage", next);
};
</script>

<template>
  <nav v-if="pages > 1" class="flex flex-wrap items-center justify-between gap-3">
    <p class="drixal-muted text-xs font-semibold">{{ t("common.showingResults", { from, to, total }) }}</p>
    <div class="flex items-center gap-2">
      <UButton :label="t('common.previous')" size="sm" variant="outline" color="neutral" :disabled="page <= 1" @click="go(page - 1)" />
      <span class="drixal-muted px-1 text-sm font-bold">{{ t("common.page") }} {{ page }}/{{ pages }}</span>
      <UButton :label="t('common.next')" size="sm" variant="outline" color="neutral" :disabled="page >= pages" @click="go(page + 1)" />
    </div>
  </nav>
</template>