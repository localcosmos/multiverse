<script setup lang="ts">
import type { NumberFilter } from 'localcosmos-client';
import NumberFilterSpace from '@/components/nature-guide/matrix-filter-spaces/NumberFilterSpace.vue';
import TranslatableGlossarizedText from '@/components/text/TranslatableGlossarizedText.vue';

const props = defineProps<{
  filter: NumberFilter;
  readOnly: boolean;
}>();

let unit = null;

if (props.filter.data.definition && props.filter.data.definition.unit) {
  unit = props.filter.data.definition.unit;
}
</script>

<template>
  <div
    class="matrix-filter number-filter"
    :class="{
      invisible: !filter.isVisible
    }"
  >
    <div class="matrix-filter-name">
      <TranslatableGlossarizedText
        :text-key="filter.data.name"
      />
      <span
        v-if="filter.data.definition && filter.data.definition.unit"
        class="number-filter-unit"
      >
        [{{ filter.data.definition.unit }}]
      </span>
    </div>
    <div class="number-filter-spaces">
      <NumberFilterSpace
        v-for="(space, counter) in filter.spaces"
        :key="counter"
        :space="space"
        :unit="unit"
        :read-only="readOnly"
      />
    </div>
  </div>
</template>

<style scoped>
.number-filter-spaces {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--size-md);
  border-radius: var(--border-radius-xs);
}

.number-filter-unit {
  padding-left: var(--size-small);
}

@media (min-width: 640px) {
  .number-filter-spaces {
    grid-template-columns: repeat(5, 1fr);
  }
}

@media (min-width: 768px) {
}

@media (min-width: 1024px) {
}

@media (min-width: 1280px) {
  .number-filter-spaces {
    grid-template-columns: repeat(8, 1fr);
  }
}

@media (min-width: 1536px) {
}
</style>