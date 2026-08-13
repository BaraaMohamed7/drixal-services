<script setup lang="ts">
const { providerHome } = useProviderSession();
await useFetch("/api/session", { key: "provider-session" });
await navigateTo(providerHome.value);
</script>

<template>
  <div />
</template>
