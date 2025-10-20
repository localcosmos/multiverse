<script setup lang="ts">
import type { TextOnlyFilterSpaceData } from 'localcosmos-client';

const props = defineProps<{
  space: TextOnlyFilterSpaceData;
  unit: string | null,
}>();
</script>

<template>
  <div class="text-only-filter-space">
    <div v-html="space.encodedSpace"></div>
  </div>
</template>

<style scoped>
.text-only-filter-space {
  width: 200px;
  aspect-ratio: 2 / 1;
  background: #FFF;
  border-radius: var(--border-radius-sm);
  padding: var(--size-md);
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>