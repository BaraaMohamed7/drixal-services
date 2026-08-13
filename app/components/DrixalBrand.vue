<script setup lang="ts">
withDefaults(defineProps<{ inverse?: boolean; compact?: boolean }>(), {
  inverse: false,
  compact: false,
});

const { t } = useLocale();
</script>

<template>
  <span class="inline-flex min-w-0 items-center gap-3">
    <svg class="size-7 shrink-0" viewBox="0 0 28 28" aria-hidden="true">
      <path d="M14 1 25.3 7.5v13L14 27 2.7 20.5v-13L14 1Z" fill="#2546F0" />
      <path d="m10.2 8.6 7.9 4.6v5.3l-4.1 2.3-4.1-2.3v-4.3l4.1 2.4 1.8-1v-1l-5.6-3.2V8.6Z" fill="white" />
    </svg>
    <span v-if="!compact" class="truncate text-base font-bold tracking-[-0.02em]" :class="inverse ? 'text-white' : 'text-[var(--drixal-ink)]'">
      {{ t("common.appName") }}
    </span>
  </span>
</template>
