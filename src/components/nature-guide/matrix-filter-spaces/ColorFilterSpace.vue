<script setup lang="ts">
import { ColorFilterSpace } from 'localcosmos-client';
import { useFilterSpace } from '@/composables/useFilterSpace';

const props = withDefaults(defineProps<{
  space: ColorFilterSpace,
  readOnly: boolean,
}>(), {
  readOnly: false,
});

const { toggleSelection } = useFilterSpace(props.space, props.readOnly);

</script>

<template>
  <div
    class="color-filter-space"
    :class="{
      'cursor-pointer': !readOnly,
      selected: space.isSelected,
      impossible: !space.isPossible,
    }"
    
    @click.stop="toggleSelection"
  >
    <div :style="`background: rgba(${space.data.encodedSpace})`">
      <span v-if="space.data.description">
        {{ space.data.description }}
      </span>
      <span v-else>
        &nbsp;
      </span>
    </div>
  </div>
</template>

<style scoped>
.color-filter-space {
  width: 100%;
  aspect-ratio: 1 / 1;
  border-radius: var(--border-radius-xs);
  padding: 4px;
  background: #FFF;
}

.color-filter-space.selected {
  background: var(--matrix-filter-selection-highlight);
}

.color-filter-space.impossible {
  opacity: 0.3;
  pointer-events: none;
}

.color-filter-space > div {
  height: 100%;
  border-radius: var(--border-radius-xs);
}
</style>

