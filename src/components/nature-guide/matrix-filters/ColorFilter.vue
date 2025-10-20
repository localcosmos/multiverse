<script setup lang="ts">
import type { ColorFilter } from 'localcosmos-client';
import ColorFilterSpace from '@/components/nature-guide/matrix-filter-spaces/ColorFilterSpace.vue';
import TranslatableGlossarizedText from '@/components/text/TranslatableGlossarizedText.vue';

defineProps<{
  filter: ColorFilter;
  readOnly: boolean;
}>();
</script>

<template>
  <div
    class="matrix-filter color-filter"
    :class="{
      invisible: !filter.isVisible
    }"
  >
    <div class="matrix-filter-name">
      <TranslatableGlossarizedText
        :text-key="filter.data.name"
      />
    </div>
    <div class="colorfilter-spaces">
      <ColorFilterSpace
        v-for="(space, counter) in filter.spaces"
        :key="counter"
        :space="space"
        :read-only="readOnly"
      />
    </div>
  </div>
</template>

<style scoped>
.colorfilter-spaces {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: var(--size-md);
  border-radius: var(--border-radius-xs);
}

@media (min-width: 640px) {
}

@media (min-width: 768px) {
}

@media (min-width: 1024px) {
}

@media (min-width: 1280px) {
  .colorfilter-spaces {
    grid-template-columns: repeat(12, 1fr);
  }
}

@media (min-width: 1536px) {
}
</style>