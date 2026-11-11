<script setup lang="ts">
const props = defineProps<{
  templateName: string,
  slug: string,
}>();

const viewName = props.templateName.toLowerCase();
</script>

<template>
  <RouterLink
    :to="{
      name: viewName,
      params: { slug: props.slug }
    }"
    class="card padding-medium"
  >
    <slot />
  </RouterLink>
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
</style>
