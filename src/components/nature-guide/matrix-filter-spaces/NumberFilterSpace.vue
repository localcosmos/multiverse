<script setup lang="ts">
import { NumberFilterSpace } from 'localcosmos-client';
import { useFilterSpace } from '@/composables/useFilterSpace';

const props = withDefaults(defineProps<{
  space: NumberFilterSpace,
  readOnly: boolean,
  unit: null|string,
}>(), {
  readOnly: false,
});

const { toggleSelection } = useFilterSpace(props.space, props.readOnly);

</script>

<template>
  <div
    class="matrix-filter-space number-filter-space"
    :class="{
      'cursor-pointer': !readOnly,
      selected: space.isSelected,
      impossible: !space.isPossible,
    }"
    @click.stop="toggleSelection"
  >
    <div>
      {{ space.data.encodedSpace }}
      <span v-if="unit" class="number-filter-space-unit">{{ unit }}</span>
    </div>
  </div>
</template>

<style scoped>
.number-filter-space {
  width: 100%;
  aspect-ratio: 1 / 1;
  border-radius: var(--border-radius-xs);
  display: flex;
  align-items: center;
  justify-content: center;
  /*padding: var(--size-md); breaks layout */
  background: var(--color-white-translucent-light);
  font-size: 24px;
  font-weight: bold;
}

</style>

