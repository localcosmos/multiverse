<script setup lang="ts">

</script>

<template>
  <div class="card bg-translucent-light padding-medium">
    <div class="card-content">
      <slot></slot>
    </div>
  </div>
</template>

<style scoped>
.card {
  border-radius: var(--border-radius-sm);
  box-shadow: var(--box-shadow);
  width: 100%;
}

.card-content {
  padding: var(--size-md) 0 0 0;
}
</style>