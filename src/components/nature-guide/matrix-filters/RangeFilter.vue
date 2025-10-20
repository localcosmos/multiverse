<script setup lang="ts">
import type { RangeFilter } from 'localcosmos-client';
import TranslatableGlossarizedText from '@/components/text/TranslatableGlossarizedText.vue';
import RangeFilterSpace from '../matrix-filter-spaces/RangeFilterSpace.vue';


defineProps<{
  filter: RangeFilter;
  readOnly: boolean;
}>();
</script>

<template>
  <div
    class="matrix-filter range-filter"
    :class="{
      invisible: !filter.isVisible
    }"
  >
    <div class="matrix-filter-name">
      <TranslatableGlossarizedText
        :text-key="filter.data.name"
      />
    </div>
    <div>
      <RangeFilterSpace
        v-for="(space, counter) in filter.spaces"
        :key="counter"
        :space="space"
        :definition="filter.data.definition"
        :read-only="readOnly"
      />
    </div>
  </div>
</template>

<style scoped>

@media (min-width: 640px) {
}

@media (min-width: 768px) {
}

@media (min-width: 1024px) {
}

@media (min-width: 1280px) {
}

@media (min-width: 1536px) {
}
</style>