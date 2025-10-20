<script setup lang="ts">
const props = defineProps<{
  flat?: boolean;
}>();
</script>

<template>
  <div class="slot-card" :class="{'flat': props.flat}">
    <slot></slot>
  </div>
</template>

<style scoped>
.slot-card {
  width: 100%;
  border-radius: var(--border-radius-sm);
  padding: var(--size-md);
  background-color: var(--color-white-translucent);
  box-shadow: var(--box-shadow);
}

.slot-card.flat {
  box-shadow: none;
  background-color: #FFF;
}
</style>