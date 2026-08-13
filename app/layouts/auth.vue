<script setup lang="ts">
const { t } = useLocale();
</script>

<template>
  <div class="min-h-screen bg-[var(--drixal-bg)] text-[var(--drixal-ink)]">
    <div class="grid min-h-screen lg:grid-cols-[minmax(24rem,0.9fr)_minmax(0,1.1fr)]">
      <aside class="relative hidden overflow-hidden bg-[#161616] p-10 text-white lg:flex lg:flex-col xl:p-14">
        <NuxtLink to="/marketplace" class="w-fit"><DrixalBrand inverse /></NuxtLink>
        <div class="my-auto max-w-lg">
          <h1 class="text-4xl font-semibold leading-[1.2] tracking-[-0.035em] xl:text-5xl">{{ t("auth.marketingTitle") }}</h1>
          <p class="mt-5 max-w-md text-base leading-7 text-[#c6c6c6]">{{ t("auth.marketingDescription") }}</p>
          <ol class="mt-10 border-t border-[#525252]">
            <li v-for="(benefit, index) in [t('auth.benefitMarketplace'), t('auth.benefitOperations'), t('auth.benefitSecurity')]" :key="benefit" class="grid grid-cols-[2rem_1fr] gap-3 border-b border-[#525252] py-4 text-sm font-semibold">
              <span class="font-variant-numeric text-[#78a9ff]">0{{ index + 1 }}</span>
              <span>{{ benefit }}</span>
            </li>
          </ol>
        </div>
        <p class="max-w-md text-xs leading-5 text-[#a8a8a8]">{{ t("auth.secureSession") }}</p>
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
