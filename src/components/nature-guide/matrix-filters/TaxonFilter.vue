<script setup lang="ts">
import type { TaxonFilter } from 'localcosmos-client';
import TaxonFilterSpace from '@/components/nature-guide/matrix-filter-spaces/TaxonFilterSpace.vue';
import TranslatableGlossarizedText from '@/components/text/TranslatableGlossarizedText.vue';

defineProps<{
  filter: TaxonFilter;
  readOnly: boolean;
}>();
</script>

<template>
  <div
    class="matrix-filter taxon-filter"
    :class="{
      invisible: !filter.isVisible
    }"
  >
    <div class="matrix-filter-name">
      <TranslatableGlossarizedText
        :text-key="filter.data.name"
      />
    </div>
    <div class="taxon-spaces">
      <TaxonFilterSpace
        v-for="(space, counter) in filter.spaces"
        :key="counter"
        :space="space"
        :read-only="readOnly"
      />
    </div>
  </div>
</template>

<style scoped>
.taxon-spaces {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--size-md);
}

@media (min-width: 640px) {
  .taxon-spaces {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 768px) {
  .taxon-spaces {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 1024px) {
  .taxon-spaces {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (min-width: 1280px) {
  .taxon-spaces {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 1536px) {
  .taxon-spaces {
    grid-template-columns: repeat(4, 1fr);
  }
}
</style>