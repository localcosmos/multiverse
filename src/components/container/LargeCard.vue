<script setup lang="ts">
    const props = defineProps<{
        rounded?: boolean;
    }>();
</script>
<template>
    <div class="large-card" :class="{
        'rounded': props.rounded
    }">
        <slot />
    </div>
</template>

<style>
s {
  :root {
    --color-large-card-bg: rgba(255, 255, 255, .75);
    --darkmode-large-card-bg: rgba(0, 0, 0, .75);
  }
}

.large-card {
    background-color: var(--color-large-card-bg);
    box-shadow: var(--box-shadow);
}

body.dark .large-card {
    background-color: var(--darkmode-large-card-bg);
}

.large-card.rounded-sm {
    border-radius: var(--border-radius-sm);
}

.large-card.rounded {
    border-radius: var(--border-radius);
}
</style>
