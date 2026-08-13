<script setup lang="ts">
const { t } = useLocale();
</script>

<template>
  <div class="min-h-screen bg-[var(--drixal-bg)] text-[var(--drixal-ink)]">
    <div class="grid min-h-screen lg:grid-cols-[minmax(360px,0.85fr)_minmax(0,1.15fr)]">
      <aside class="hidden bg-[var(--drixal-navy)] p-10 text-white lg:flex lg:flex-col">
        <NuxtLink to="/marketplace" class="flex items-center gap-3">
          <span class="grid size-11 place-items-center rounded-lg bg-[var(--ui-text-inverted)] text-xs font-black text-[var(--color-brand)]">{{ t("shell.brandMark") }}</span>
          <span class="text-xl font-black">{{ t("common.appName") }}</span>
        </NuxtLink>
        <div class="my-auto max-w-md">
          <p class="text-xs font-black uppercase tracking-[0.2em] text-white/60">{{ t("auth.eyebrow") }}</p>
          <h1 class="mt-4 text-4xl font-semibold leading-tight">{{ t("auth.marketingTitle") }}</h1>
          <p class="mt-5 text-base leading-7 text-white/70">{{ t("auth.marketingDescription") }}</p>
          <div class="mt-8 grid gap-3 text-sm font-semibold text-white/85">
            <p class="flex items-center gap-3"><span class="size-2 rounded-full bg-[var(--drixal-400)]" />{{ t("auth.benefitMarketplace") }}</p>
            <p class="flex items-center gap-3"><span class="size-2 rounded-full bg-[var(--drixal-400)]" />{{ t("auth.benefitOperations") }}</p>
            <p class="flex items-center gap-3"><span class="size-2 rounded-full bg-[var(--drixal-400)]" />{{ t("auth.benefitSecurity") }}</p>
          </div>
        </div>
        <p class="text-xs text-white/50">{{ t("auth.secureSession") }}</p>
      </aside>
      <main class="flex min-w-0 flex-col">
        <header class="flex items-center justify-between gap-3 p-4 sm:p-6">
          <NuxtLink to="/marketplace" class="flex items-center gap-3 lg:hidden"><span class="grid size-9 place-items-center rounded-lg bg-[var(--color-brand)] text-xs font-black text-white">{{ t("shell.brandMark") }}</span><span class="font-black">{{ t("common.appName") }}</span></NuxtLink>
          <span class="hidden lg:block" />
          <AppPreferences />
        </header>
        <div class="grid flex-1 place-items-center px-4 pb-12 sm:px-6"><div class="w-full max-w-md"><slot /></div></div>
      </main>
    </div>
  </div>
</template>
