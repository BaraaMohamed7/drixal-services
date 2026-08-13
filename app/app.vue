<script setup lang="ts">
import { Comment, h } from "vue";

const DesignContract = () => h(Comment, `
THESIS: Drixal is an operational control plane, not a collection of decorative SaaS cards.
OWN-WORLD: Cairo type, Atlassian-inspired semantic tokens, purposeful surface elevation, comfortable geometry, and Drixal blue for primary action.
STORY: Each role sees current service work, finds exceptions, and moves directly to the next operational decision.
FIRST VIEWPORT: A calm product shell frames the current context, next action, operational queue, and supporting metrics.
FORM: Atlassian-inspired teamwork software adapted for bilingual service operations, not a visual copy of Atlassian products.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, and DESIGN.md
`);
</script>

<template>
  <DesignContract />
  <NuxtRouteAnnouncer />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
