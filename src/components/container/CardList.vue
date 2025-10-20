<script setup lang="ts">
</script>

<template>
  <div class="card-list">
    <slot />
  </div>
</template>

<style scoped>
.card-list {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  margin: 2rem 0;
}

@media (min-width: 600px) {
  .card-list {
    grid-template-columns: 1fr 1fr;
  }
}

@media (min-width: 1024px) {
  .card-list {
    grid-template-columns: 1fr 1fr 1fr;
  }
}

.card-link {
  display: block;
}

@media (min-width: 640px) {
}

@media (min-width: 768px) {
}

@media (min-width: 1280px) {
}

@media (min-width: 1536px) {
}
</style>