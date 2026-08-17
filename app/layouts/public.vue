<script setup lang="ts">
const { t } = useLocale();
const auth = useAuth();
const route = useRoute();
await auth.load();
const navClass = (path: string) => route.path === path
  ? "bg-[var(--color-brand-subtle)] text-[var(--drixal-blue)]"
  : "text-[var(--drixal-muted)] hover:bg-[var(--drixal-hover)] hover:text-[var(--drixal-ink)]";
</script>

<template>
  <div class="min-h-screen bg-[var(--drixal-bg)] text-[var(--drixal-ink)]">
    <header class="sticky top-0 z-40 border-b border-[var(--drixal-line)] bg-[var(--drixal-surface)] shadow-[0_1px_2px_rgb(9_30_66/0.08)]">
      <div class="mx-auto flex h-14 max-w-[1600px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <NuxtLink to="/marketplace" aria-label="Drixal">
          <DrixalBrand />
        </NuxtLink>
        <nav class="hidden h-full items-center md:flex" :aria-label="t('common.marketplace')">
          <NuxtLink to="/marketplace" class="my-2 flex h-10 items-center rounded-md px-4 text-sm font-semibold" :class="navClass('/marketplace')">{{ t("common.marketplace") }}</NuxtLink>
          <NuxtLink v-if="auth.session.value.user?.type !== 'SUPER_ADMIN'" :to="auth.session.value.authenticated ? '/register/company' : { path: '/auth/register', query: { next: '/register/company' } }" class="my-2 flex h-10 items-center rounded-md px-4 text-sm font-semibold" :class="navClass('/register/company')">{{ t("marketplace.registerCompany") }}</NuxtLink>
        </nav>
        <div class="flex items-center gap-2">
          <AppPreferences class="hidden sm:flex" />
          <UButton v-if="auth.session.value.authenticated" :to="auth.workspaceHome.value" :label="t('shell.openWorkspace')" />
          <template v-else>
            <UButton to="/auth/login" :label="t('auth.signIn')" color="neutral" variant="ghost" />
            <UButton to="/auth/register" :label="t('auth.createAccount')" class="hidden xs:inline-flex sm:inline-flex" />
          </template>
        </div>
      </div>
      <div class="flex items-center justify-end border-t border-[var(--drixal-line)] p-2 sm:hidden">
        <AppPreferences />
      </div>
    </header>
    <main class="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8"><slot /></main>
  </div>
</template>
