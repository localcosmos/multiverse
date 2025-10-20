<script setup lang="ts">
import type { ColorFilterSpaceData } from 'localcosmos-client';

const props = defineProps<{
  space: ColorFilterSpaceData;
  unit: string | null,
}>();
</script>

<template>
  <div class="read-only-color-filter-space">
    <div :style="`background: rgba(${space.encodedSpace})`">
      <span v-if="space.description">
        {{ space.description }}
      </span>
      &nbsp;
    </div>
  </div>
</template>

<style scoped>
.read-only-color-filter-space {
  width: 75px;
  aspect-ratio: 1 / 1;
  border-radius: var(--border-radius-xs);
  padding: 4px;
  background: #FFF;
}

.read-only-color-filter-space > div {
  height: 100%;
  border-radius: var(--border-radius-xs);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
}
</style>