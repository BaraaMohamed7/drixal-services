<script setup lang="ts">
import type { LocaleCode } from "~/utils/locales";

const { locale, locales, setLocale, t } = useLocale();
const colorMode = useColorMode();

const localeOptions = computed(() =>
  locales.map((code) => ({
    label: code === "ar" ? t("common.arabic") : t("common.english"),
    value: code,
  })),
);

const navItems = computed(() => [
  { label: t("common.provider"), mark: "P", to: "/provider/services" },
  { label: t("common.requests"), mark: "R", to: "/provider/requests" },
  { label: t("common.orders"), mark: "O", to: "/provider/orders" },
  { label: t("common.customers"), mark: "C", to: "/provider/customers" },
  { label: t("common.marketplace"), mark: "M", to: "/marketplace" },
]);

const themeOptions = computed(() => [
  { label: t("common.light"), value: "light" },
  { label: t("common.dark"), value: "dark" },
  { label: t("common.system"), value: "system" },
]);
</script>

<template>
  <div class="min-h-screen bg-[var(--drixal-bg)] text-[var(--drixal-ink)]">
    <NuxtRouteAnnouncer />
    <div class="mx-auto grid min-h-screen max-w-[1440px] gap-0 p-3 lg:grid-cols-[240px_1fr] lg:p-6">
      <aside class="drixal-card hidden rounded-xl p-4 lg:flex lg:flex-col">
        <NuxtLink to="/provider/services" class="flex items-center gap-3 px-2 py-2">
          <span class="grid size-10 place-items-center rounded-lg bg-[var(--drixal-blue)] text-xs font-black text-[var(--ui-text-inverted)]">{{ t("shell.brandMark") }}</span>
          <span>
            <span class="block text-lg font-black text-[var(--drixal-blue)]">{{ t("common.appName") }}</span>
            <span class="drixal-muted block text-xs font-semibold">{{ t("common.appSubtitle") }}</span>
          </span>
        </NuxtLink>

        <nav class="mt-6 grid gap-1">
          <NuxtLink v-for="item in navItems" :key="item.to" :to="item.to" class="drixal-muted flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-bold transition hover:bg-[var(--drixal-hover)] hover:text-[var(--drixal-blue)]">
            <span class="grid size-6 place-items-center rounded bg-[var(--drixal-soft-strong)] text-[10px] font-black text-[var(--drixal-ink)]">{{ item.mark }}</span>
            <span>{{ item.label }}</span>
          </NuxtLink>
        </nav>

        <div class="mt-auto border-t border-[var(--drixal-line)] pt-4">
          <UButton :label="locale === 'ar' ? 'خروج' : 'Logout'" color="neutral" variant="ghost" block />
        </div>
      </aside>

      <div class="min-w-0 lg:px-4">
        <header class="drixal-card sticky top-3 z-20 mb-4 rounded-xl px-4 py-3 lg:top-6">
          <div class="flex items-center justify-between gap-3">
            <NuxtLink to="/provider/services" class="flex min-w-0 items-center gap-3 lg:hidden">
              <span class="grid size-9 shrink-0 place-items-center rounded-lg bg-[var(--drixal-blue)] text-xs font-black text-[var(--ui-text-inverted)]">{{ t("shell.brandMark") }}</span>
              <span class="truncate text-sm font-black text-[var(--drixal-blue)]">{{ t("common.appName") }}</span>
            </NuxtLink>

            <div class="drixal-muted hidden min-w-0 flex-1 items-center gap-3 rounded-lg border border-[var(--drixal-line)] bg-[var(--drixal-soft)] px-3 py-2 text-sm lg:flex">
              <span>{{ t("shell.searchPlaceholder") }}</span>
            </div>

            <nav class="flex items-center gap-1 lg:hidden">
              <NuxtLink v-for="item in navItems" :key="item.to" :to="item.to" class="drixal-muted grid size-10 place-items-center rounded-xl hover:bg-[var(--drixal-hover)] hover:text-[var(--drixal-blue)]">
                <span class="text-xs font-black">{{ item.mark }}</span>
              </NuxtLink>
            </nav>

            <div class="flex shrink-0 items-center gap-2">
              <USelect :model-value="colorMode.preference" :items="themeOptions" value-key="value" label-key="label" class="w-28" size="sm" :aria-label="t('common.theme')" @update:model-value="colorMode.preference = String($event)" />
              <USelect :model-value="locale" :items="localeOptions" value-key="value" label-key="label" class="w-28" size="sm" @update:model-value="setLocale($event as LocaleCode)" />
            </div>
          </div>
        </header>

        <main class="min-w-0">
          <NuxtPage />
        </main>
      </div>
    </div>
  </div>
</template>
