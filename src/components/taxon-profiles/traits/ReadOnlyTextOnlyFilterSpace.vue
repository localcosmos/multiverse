<script setup lang="ts">
import type { TextOnlyFilterSpaceData } from 'localcosmos-client';

const props = defineProps<{
  space: TextOnlyFilterSpaceData;
  unit: string | null,
}>();
</script>

<template>
  <div class="ro-text-only-filter-space">
    <div v-html="space.encodedSpace"></div>
  </div>
</template>

<style>
.ro-text-only-filter-space {
  width: 200px;
  aspect-ratio: 3 / 2;
  background: #FFF;
  border-radius: var(--border-radius-sm);
  padding: var(--size-md);
  display: flex;
  align-items: center;
  justify-content: center;
}

.ro-text-only-filter-space p {
  margin-bottom: 0px;
}
</style>
