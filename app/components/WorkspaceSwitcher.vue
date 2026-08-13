<script setup lang="ts">
const { t } = useLocale();
const auth = useAuth();
const pending = ref(false);
const error = ref("");

const items = computed(() => {
  const options = [{
    label: t("workspaces.personal.title"),
    description: t("workspaces.personal.description"),
    icon: "i-lucide-user-round",
    value: "personal",
  }];

  for (const membership of auth.session.value.memberships) {
    if (!membership.company) continue;
    options.push({
      label: membership.company.name,
      description: t(`roles.${membership.role}`),
      icon: "i-lucide-building-2",
      value: `company:${membership.company.id}`,
    });
  }

  if (auth.session.value.user?.platformRole === "SUPER_ADMIN") {
    options.push({
      label: t("workspaces.platform.title"),
      description: t("roles.SUPER_ADMIN"),
      icon: "i-lucide-shield-check",
      value: "platform",
    });
  }

  return options;
});

const selected = computed(() => {
  const workspace = auth.session.value.activeWorkspace;
  if (workspace?.type === "COMPANY") return `company:${workspace.companyId}`;
  if (workspace?.type === "PLATFORM") return "platform";
  return "personal";
});

const selectWorkspace = async (value: unknown) => {
  if (typeof value !== "string" || value === selected.value) return;
  pending.value = true;
  error.value = "";

  try {
    if (value === "personal") await auth.switchWorkspace({ type: "PERSONAL" });
    else if (value === "platform") await auth.switchWorkspace({ type: "PLATFORM" });
    else if (value.startsWith("company:")) await auth.switchWorkspace({ type: "COMPANY", companyId: value.slice(8) });
    else return;
    await navigateTo(auth.workspaceHome.value);
  } catch (err) {
    error.value = err instanceof Error ? err.message : t("shell.workspaceSwitchError");
  } finally {
    pending.value = false;
  }
};
</script>

<template>
  <div class="grid gap-2">
    <USelect
      :model-value="selected"
      :items="items"
      value-key="value"
      label-key="label"
      :loading="pending"
      :disabled="pending"
      class="w-full"
      :aria-label="t('shell.switchWorkspace')"
      @update:model-value="selectWorkspace"
    />
    <p v-if="error" class="text-xs font-semibold text-[var(--color-danger-text)]" role="alert">{{ error }}</p>
  </div>
</template>
