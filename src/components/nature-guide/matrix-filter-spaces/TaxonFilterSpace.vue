<script setup lang="ts">
import { TaxonFilterSpace } from 'localcosmos-client';
import { useFilterSpace } from '@/composables/useFilterSpace';

const props = withDefaults(defineProps<{
  space: TaxonFilterSpace,
  readOnly: boolean,
}>(), {
  readOnly: false,
});

const { toggleSelection } = useFilterSpace(props.space, props.readOnly);

</script>

<template>
  <div
    class="matrix-filter-space taxon-filter-space"
    :class="{
      'cursor-pointer': !readOnly,
      selected: space.isSelected,
      impossible: !space.isPossible,
    }"
    :style="`background: rgba(${space.data.encodedSpace})`"
    @click.stop="toggleSelection"
  >
    <div>
      {{ space.data.latname }}
    </div>
  </div>
</template>

<style scoped>
.taxon-filter-space {
  width: 100%;
  aspect-ratio: 4 / 1;
  border-radius: var(--border-radius);
  display: flex;
  align-items: center;
  justify-content: center;
  /*padding: var(--size-md);*/
  background: var(--color-white-translucent-light);
}
</style>

