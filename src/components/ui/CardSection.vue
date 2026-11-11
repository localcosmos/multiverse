<script setup lang="ts">

</script>

<template>
  <div class="card padding-medium">
    <div class="card-content">
      <slot></slot>
    </div>
  </div>
</template>

<style scoped>
@layer defaults {
  :global(:root) {
    --card-bg: var(--color-white-translucent);
    --card-text-color: #000;

    --darkmode--card-bg: #000;
    --darkmode--card-text-color: #FFF;
  }
}

.card {
  border-radius: var(--border-radius-sm);
  box-shadow: var(--box-shadow);
  width: 100%;
  background: var(--card-bg);
  color: var(--card-text-color);
}

body.dark .card {
  background: var(--darkmode--card-bg);
  color: var(--darkmode--card-text-color);
}

.card-content {
  padding: var(--size-md) 0 0 0;
}
</style>
