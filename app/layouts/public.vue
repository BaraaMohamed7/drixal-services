<script setup lang="ts">
const { t } = useLocale();
const auth = useAuth();
await auth.load();
</script>

<template>
  <div class="min-h-screen bg-[var(--drixal-bg)] text-[var(--drixal-ink)]">
    <header class="border-b border-[var(--drixal-line)] bg-[var(--drixal-surface)]">
      <div class="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <NuxtLink to="/marketplace" class="flex min-w-0 items-center gap-3">
          <span class="grid size-10 shrink-0 place-items-center rounded-lg bg-[var(--color-brand)] text-xs font-black text-white">{{ t("shell.brandMark") }}</span>
          <span><span class="block font-black text-[var(--drixal-ink)]">{{ t("common.appName") }}</span><span class="drixal-muted block text-xs">{{ t("shell.marketplaceSubtitle") }}</span></span>
        </NuxtLink>
        <nav class="hidden items-center gap-5 text-sm font-semibold md:flex">
          <NuxtLink to="/marketplace" class="drixal-muted hover:text-[var(--drixal-blue)]">{{ t("common.marketplace") }}</NuxtLink>
          <NuxtLink :to="auth.session.value.authenticated ? '/register/company' : { path: '/auth/register', query: { next: '/register/company' } }" class="drixal-muted hover:text-[var(--drixal-blue)]">{{ t("marketplace.registerCompany") }}</NuxtLink>
        </nav>
        <div class="flex items-center gap-2">
          <AppPreferences class="hidden sm:flex" />
          <UButton v-if="auth.session.value.authenticated" :to="auth.workspaceHome.value" :label="t('shell.openWorkspace')" />
          <template v-else>
            <UButton to="/auth/login" :label="t('auth.signIn')" color="neutral" variant="ghost" />
            <UButton to="/auth/register" :label="t('auth.createAccount')" />
          </template>
        </div>
      </div>
    </header>
    <main class="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8"><slot /></main>
  </div>
</template>
