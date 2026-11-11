<script setup lang="ts">

const props = defineProps<{
  roleName?: string;
  isContextTaxon?: boolean;
}>();


</script>

<template>
  <div class="related-taxa-card" :class="{ 'related-taxa-card--context-taxon': isContextTaxon }">
    <div class="related-taxa-card__role-label">
      <span v-if="roleName">{{ roleName }}</span>
      <span v-else>&nbsp;</span>
    </div>
    <div class="related-taxa-card__related-taxa">
      <slot />
    </div>
  </div>
</template>

<style>
.related-taxa-card {
  background: var(--color-neutral);
  padding: var(--size-md);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.related-taxa-card--context-taxon {
  background: var(--color-accent-3);
}

.related-taxa-card__role-label {
  font-weight: bold;
  text-align: center;
  font-size: var(--font-size-lg);
  color: var(--color-accent-3);
  text-transform: uppercase;
  padding-bottom: var(--size-md);
}

.related-taxa-card--context-taxon .related-taxa-card__role-label {
  color: var(--color-neutral);
}

.related-taxa-card__related-taxa {
  flex-grow: 1;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: var(--size-xl);
  justify-content: center;
  align-items: stretch;
}

.rel-card-no-image {
  width: 100%;
  aspect-ratio: 1/1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted);
}
</style>
