<script setup lang="ts">
const props = defineProps<{
  flat?: boolean;
}>();
</script>

<template>
  <div class="slot-card" :class="{ flat: props.flat }">
    <slot></slot>
  </div>
</template>

<style>
@layer defaults {
  :root {
    --slot-card-bg: var(--bg-translucent);
    --slot-card-bg-flat: #fff;

    --slot-card-box-shadow: var(--box-shadow);
    --slot-card-box-shadow-flat: none;

    --darkmode-slot-card-bg: rgba(0,0,0, .8);
    --darkmode-slot-card-box-shadow: var(--box-shadow-dark);

    --darkmode-slot-card-bg-flat: #000;
    --darkmode-slot-card-box-shadow-flat: none;
  }
}

.slot-card {
  width: 100%;
  border-radius: var(--border-radius-sm);
  padding: var(--size-md);
  background-color: var(--slot-card-bg);
  box-shadow: var(--slot-card-box-shadow);
}

body.dark .slot-card {
  background-color: var(--darkmode-slot-card-bg);
  box-shadow: var(--darkmode-slot-card-box-shadow);
}

.slot-card.flat {
  box-shadow: var(--slot-card-box-shadow-flat);
  background-color: var(--slot-card-bg-flat);
}

body.dark .slot-card.flat {
  background-color: var(--darkmode-slot-card-bg-flat);
  box-shadow: var(--darkmode-slot-card-box-shadow-flat);
}
</style>
