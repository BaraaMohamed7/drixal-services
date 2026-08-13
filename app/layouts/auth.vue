<script setup lang="ts">
const { t } = useLocale();
</script>

<template>
  <div class="min-h-screen bg-[var(--drixal-bg)] text-[var(--drixal-ink)]">
    <div class="grid min-h-screen lg:grid-cols-[minmax(24rem,0.9fr)_minmax(0,1.1fr)]">
      <aside class="relative hidden overflow-hidden border-e border-[var(--color-brand-border)] bg-[var(--color-brand-subtle)] p-10 lg:flex lg:flex-col xl:p-14">
        <NuxtLink to="/marketplace" class="w-fit"><DrixalBrand /></NuxtLink>
        <div class="my-auto max-w-lg">
          <h1 class="text-4xl font-bold leading-[1.2] tracking-[-0.035em] text-[var(--drixal-ink)] xl:text-5xl">{{ t("auth.marketingTitle") }}</h1>
          <p class="mt-5 max-w-md text-base leading-7 text-[var(--drixal-muted)]">{{ t("auth.marketingDescription") }}</p>
          <ol class="mt-10 grid gap-3">
            <li v-for="(benefit, index) in [t('auth.benefitMarketplace'), t('auth.benefitOperations'), t('auth.benefitSecurity')]" :key="benefit" class="grid grid-cols-[2rem_1fr] items-center gap-3 rounded-lg border border-[var(--color-brand-border)] bg-[var(--drixal-surface)] p-4 text-sm font-semibold shadow-[var(--shadow-raised)]">
              <span class="grid size-8 place-items-center rounded-md bg-[var(--color-brand-subtle-hover)] font-variant-numeric text-[var(--drixal-blue)]">{{ index + 1 }}</span>
              <span>{{ benefit }}</span>
            </li>
          </ol>
        </div>
        <p class="max-w-md text-xs leading-5 text-[var(--drixal-muted)]">{{ t("auth.secureSession") }}</p>
      </aside>
      <main class="flex min-w-0 flex-col">
        <header class="flex h-14 items-center justify-between border-b border-[var(--drixal-line)] bg-[var(--drixal-surface)] px-4 sm:px-6">
          <NuxtLink to="/marketplace" class="lg:hidden"><DrixalBrand /></NuxtLink>
          <span class="hidden lg:block" />
          <AppPreferences />
        </header>
        <div class="grid flex-1 place-items-center px-4 py-10 sm:px-6">
          <div class="w-full max-w-md"><slot /></div>
        </div>
      </main>
    </div>
  </div>
</template>
