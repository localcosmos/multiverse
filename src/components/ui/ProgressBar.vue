<script setup lang="ts">
import { computed } from 'vue';
const props = defineProps<{
  current: number,
  total: number,
}>();

const percentage = computed(() => {
  const p = Math.round( (props.current/props.total) * 100);
  return p;
});
</script>

<template>
  <div class="w-full mt-md">
    <div class="progress-bar">
      <div class="progress-bar-progress" :style="`width:${percentage}%`"></div>
    </div>
    <slot>
      <div class="text-center mt-md">
        {{ percentage }}%
      </div>
    </slot>
  </div>
</template>

<style scoped>
  .progress-bar {
    width: 100%;
    height: 24px;
    border: 1px solid var(--color-grey);
    border-radius: .5em;
  }

  .progress-bar-progress {
    height: 100%;
    background: var(--color-success);
    border-radius: .5em;
    transition: all 0.5s;
  }
</style>
