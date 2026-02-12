<script setup lang="ts">
import { resolveReadOnlySpaceComponent } from '@/utils/filterComponentResolver';
import type { MatrixFilterDataTypes } from 'localcosmos-client';
import TranslatableGlossarizedText from '@/components/text/TranslatableGlossarizedText.vue';

const props = defineProps<{
  filter:  MatrixFilterDataTypes;
}>();

const spaceComponent = resolveReadOnlySpaceComponent(props.filter.type);
</script>

<template>
  <div>
    <div class="matrix-filter-ro-name">
      <TranslatableGlossarizedText
        :text-key="filter.name"
      />
      <span
        v-if="filter.definition && filter.definition.unit"
        class="number-filter-unit"
      >
        [{{ filter.definition.unit }}]
      </span>
    </div>
    <div class="matrix-filter-ro-spaces">
      <!-- Render spaces using the resolved component -->
      <component
        v-for="(space, counter) in filter.space" :key="counter"
        :is="spaceComponent"
        :space="space"
        :unit="filter.definition?.unit || null"
      />
    </div>
  </div>
</template>

<style scoped>
.matrix-filter-ro-name {
  font-weight: bold;
  font-size: var(--font-size-xl);
}

.matrix-filter-ro-spaces {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: var(--size-md);
  margin-top: var(--size-sm);
  width: 100%;
}
</style>