<script setup lang="ts">
definePageMeta({ layout: "auth" });

const route = useRoute();
const auth = useAuth();
const { t } = useLocale();
const pending = ref(false);
const error = ref("");
const form = reactive({ name: "", email: "", password: "", confirmation: "" });
const nextPath = computed(() => typeof route.query.next === "string" && route.query.next.startsWith("/") && !route.query.next.startsWith("//") ? route.query.next : "");
const loginLink = computed(() => ({ path: "/auth/login", query: nextPath.value ? { next: nextPath.value } : {} }));

const register = async () => {
  error.value = "";
  if (form.password !== form.confirmation) {
    error.value = t("auth.passwordMismatch");
    return;
  }

  pending.value = true;
  try {
    await $fetch("/api/auth/register", { method: "POST", body: { name: form.name, email: form.email, password: form.password } });
    await auth.load(true);
    const next = nextPath.value || "/customer";
    await navigateTo(next);
  } catch (err) {
    error.value = err instanceof Error ? err.message : t("auth.registerError");
  } finally {
    pending.value = false;
  }
};
</script>

<template>
  <div class="drixal-card p-6 sm:p-8">
    <h1 class="text-2xl font-semibold tracking-tight">{{ t("auth.createAccountTitle") }}</h1>
    <p class="drixal-muted mt-2 text-sm leading-6">{{ t("auth.createAccountDescription") }}</p>
    <form class="mt-7 grid gap-4" @submit.prevent="register">
      <UFormField :label="t('auth.fullName')" required><UInput v-model="form.name" autocomplete="name" required class="w-full" :placeholder="t('auth.namePlaceholder')" /></UFormField>
      <UFormField :label="t('common.email')" required><UInput v-model="form.email" type="email" autocomplete="email" required class="w-full" :placeholder="t('auth.emailPlaceholder')" /></UFormField>
      <UFormField :label="t('auth.password')" required><UInput v-model="form.password" type="password" autocomplete="new-password" required minlength="8" class="w-full" :placeholder="t('auth.newPasswordPlaceholder')" /></UFormField>
      <UFormField :label="t('auth.confirmPassword')" required><UInput v-model="form.confirmation" type="password" autocomplete="new-password" required minlength="8" class="w-full" :placeholder="t('auth.confirmPasswordPlaceholder')" /></UFormField>
      <p v-if="error" class="drixal-danger p-3 text-sm font-semibold">{{ error }}</p>
      <UButton type="submit" block size="lg" :loading="pending" :label="t('auth.createAccount')" />
    </form>
    <p class="drixal-muted mt-6 text-center text-sm">{{ t("auth.haveAccount") }} <NuxtLink :to="loginLink" class="font-bold text-[var(--drixal-blue)] hover:underline">{{ t("auth.signIn") }}</NuxtLink></p>
  </div>
</template>
