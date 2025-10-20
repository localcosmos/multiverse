<script setup lang="ts">
import type { TaxonFilterSpaceData } from 'localcosmos-client';

const props = defineProps<{
  space: TaxonFilterSpaceData;
  unit: string | null,
}>();
</script>

<template>
  <div class="taxon-filter-space">
    {{ space.latname }}
  </div>
</template>

<style scoped>
.taxon-filter-space {
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