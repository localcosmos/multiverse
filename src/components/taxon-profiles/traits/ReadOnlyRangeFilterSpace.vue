<script setup lang="ts">
import type { RangeFilterSpaceData } from 'localcosmos-client';

const props = defineProps<{
  space: RangeFilterSpaceData;
  unit: string | null,
}>();
</script>

<template>
  <div class="read-only-range-filter-space">
    {{ space.encodedSpace[0] }}<span v-if="unit">{{ unit }}</span> - {{ space.encodedSpace[1] }}<span v-if="unit">{{ unit }}</span>
  </div>
</template>

<style scoped>
.read-only-range-filter-space {
  width: 100px;
  aspect-ratio: 2 / 1;
  background: #FFF;
  border-radius: var(--border-radius-sm);
  padding: var(--size-md);
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>