<script setup lang="ts">
import { TextOnlyFilterSpace } from 'localcosmos-client';
import { useFilterSpace } from '@/composables/useFilterSpace';

const props = withDefaults(defineProps<{
  space: TextOnlyFilterSpace,
  readOnly: boolean,
}>(), {
  readOnly: false,
});

const { toggleSelection } = useFilterSpace(props.space, props.readOnly);

</script>

<template>
  <div
    class="matrix-filter-space text-only-filter-space"
    :class="{
      'cursor-pointer': !readOnly,
      selected: space.isSelected,
      impossible: !space.isPossible,
    }"
    @click.stop="toggleSelection"
  >
    <div v-html="space.data.encodedSpace"></div>
  </div>
</template>

<style>
@layer defaults {
  :root {
    --text-only-filter-space-bg: white;
    --text-only-filter-space-border-radius: var(--border-radius);

    --darkmode-text-only-filter-space-bg: black;
  }
}
.text-only-filter-space {
  width: 100%;
  aspect-ratio: 3 / 2;
  background: var(--text-only-filter-space-bg);
  border-radius: var(--text-only-filter-space-border-radius);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--size-md);
}

body.dark .text-only-filter-space {
  background: var(--darkmode-text-only-filter-space-bg);
}

.text-only-filter-space p {
  margin-bottom: 0;
}
</style>

