<script setup lang="ts">
import type { DescriptiveTextAndImagesFilter } from 'localcosmos-client';
import DescriptiveTextAndImagesFilterSpace from '@/components/nature-guide/matrix-filter-spaces/DescriptiveTextAndImagesFilterSpace.vue';
import TranslatableGlossarizedText from '@/components/text/TranslatableGlossarizedText.vue';

const props = defineProps<{
  filter: DescriptiveTextAndImagesFilter;
  readOnly: boolean;
}>();

</script>

<template>
  <div
    class="matrix-filter"
    :class="{
      invisible: !filter.isVisible
    }"
  >
    <div class="matrix-filter-name">
      <TranslatableGlossarizedText
        :text-key="filter.data.name"
      />
    </div>
    <div class="dtai-spaces">
      <DescriptiveTextAndImagesFilterSpace
        v-for="(space, counter) in filter.spaces"
        :key="counter"
        :space="space"
        :read-only="readOnly"
      />
    </div>
  </div>
</template>

<style scoped>
.dtai-spaces {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--size-md);
}

@media (min-width: 640px) {
}

@media (min-width: 768px) {
  .dtai-spaces {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (min-width: 1024px) {
  .dtai-spaces {
    grid-template-columns: repeat(5, 1fr);
  }
}

@media (min-width: 1280px) {
  .dtai-spaces {
    grid-template-columns: repeat(6, 1fr);
  }
}

@media (min-width: 1536px) {
  .dtai-spaces {
    grid-template-columns: repeat(8, 1fr);
  }
}
</style>