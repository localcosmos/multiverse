<script setup lang="ts">
import type { NumberFilterSpaceData } from 'localcosmos-client';

const props = defineProps<{
  space: NumberFilterSpaceData;
  unit: string | null,
}>();
</script>

<template>
  <div class="read-only-number-filter-space">
    <div>
      {{ space. encodedSpace}}
      <span v-if="unit" class="number-filter-space-unit">{{ unit }}</span>
    </div>
  </div>
</template>

<style scoped>
.read-only-number-filter-space {
  width: 75px;
  aspect-ratio: 2 / 1;
  border-radius: var(--border-radius-xs);
  display: flex;
  align-items: center;
  justify-content: center;
  /*padding: var(--size-md); breaks layout */
  background: var(--color-white-translucent-light);
  font-size: 16px;
  font-weight: bold;
}
</style>