<script setup lang="ts">
import type { LocaleCode } from "~/utils/locales";

const { locale, locales, setLocale, t } = useLocale();
const colorMode = useColorMode();
const localeOptions = computed(() =>
  locales.map((code) => ({ label: code === "ar" ? t("common.arabic") : t("common.english"), value: code })),
);
const themeOptions = computed(() => [
  { label: t("common.light"), value: "light" },
  { label: t("common.dark"), value: "dark" },
  { label: t("common.system"), value: "system" },
]);
</script>

<template>
  <div class="flex items-center gap-px">
    <USelect :model-value="colorMode.preference" :items="themeOptions" value-key="value" label-key="label" class="w-24 sm:w-28" size="sm" :aria-label="t('common.theme')" @update:model-value="colorMode.preference = String($event)" />
    <USelect :model-value="locale" :items="localeOptions" value-key="value" label-key="label" class="w-24 sm:w-28" size="sm" :aria-label="t('common.language')" @update:model-value="setLocale($event as LocaleCode)" />
  </div>
</template>
