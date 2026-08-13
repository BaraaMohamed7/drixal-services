<script setup lang="ts">
definePageMeta({ layout: "auth" });

const route = useRoute();
const auth = useAuth();
const { t } = useLocale();
const pending = ref(false);
const error = ref("");
const form = reactive({ email: "", password: "" });

const login = async () => {
  pending.value = true;
  error.value = "";
  try {
    await $fetch("/api/auth/login", { method: "POST", body: form });
    await auth.load(true);
    const next = typeof route.query.next === "string" && route.query.next.startsWith("/") ? route.query.next : auth.workspaceHome.value;
    await navigateTo(next);
  } catch (err) {
    error.value = err instanceof Error ? err.message : t("auth.loginError");
  } finally {
    pending.value = false;
  }
};
</script>

<template>
  <div class="drixal-card p-6 sm:p-8">
    <h1 class="text-2xl font-semibold tracking-tight">{{ t("auth.signInTitle") }}</h1>
    <p class="drixal-muted mt-2 text-sm leading-6">{{ t("auth.signInDescription") }}</p>

    <form class="mt-7 grid gap-4" @submit.prevent="login">
      <UFormField :label="t('common.email')" required>
        <UInput v-model="form.email" type="email" autocomplete="email" required class="w-full" :placeholder="t('auth.emailPlaceholder')" />
      </UFormField>
      <UFormField :label="t('auth.password')" required>
        <UInput v-model="form.password" type="password" autocomplete="current-password" required class="w-full" :placeholder="t('auth.passwordPlaceholder')" />
      </UFormField>
      <p v-if="error" class="drixal-danger p-3 text-sm font-semibold">{{ error }}</p>
      <UButton type="submit" block size="lg" :loading="pending" :label="t('auth.signIn')" />
    </form>

    <p class="drixal-muted mt-6 text-center text-sm">{{ t("auth.noAccount") }} <NuxtLink to="/auth/register" class="font-bold text-[var(--drixal-blue)] hover:underline">{{ t("auth.createAccount") }}</NuxtLink></p>
  </div>
</template>
