<script setup lang="ts">
definePageMeta({ layout: "public" });

const auth = useAuth();
await auth.load();
await navigateTo(auth.session.value.authenticated ? auth.workspaceHome.value : "/marketplace");
</script>

<template>
  <div />
</template>
