<script setup lang="ts">
import type { TextOnlyFilter } from 'localcosmos-client';
import TextOnlyFilterSpace from '@/components/nature-guide/matrix-filter-spaces/TextOnlyFilterSpace.vue';
import TranslatableGlossarizedText from '@/components/text/TranslatableGlossarizedText.vue';

defineProps<{
  filter: TextOnlyFilter;
  readOnly: boolean;
}>();
</script>

<template>
  <div
    class="matrix-filter text-only-filter"
    :class="{
      invisible: !filter.isVisible
    }"
  >
    <div class="matrix-filter-name">
      <TranslatableGlossarizedText
        :text-key="filter.data.name"
      />
    </div>
    <div class="to-spaces">
      <TextOnlyFilterSpace
        v-for="(space, counter) in filter.spaces"
        :key="counter"
        :space="space"
        :read-only="readOnly"
      />
    </div>
  </div>
</template>

<style scoped>
.to-spaces {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--size-md);
}

@media (min-width: 640px) {
  .to-spaces {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 768px) {
  .to-spaces {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 1024px) {
  .to-spaces {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (min-width: 1280px) {
  .to-spaces {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 1536px) {
  .to-spaces {
    grid-template-columns: repeat(4, 1fr);
  }
}
</style>