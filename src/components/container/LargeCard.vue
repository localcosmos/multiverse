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

<style scoped>
.large-card {
    background-color: rgba(255, 255, 255, .75);
    box-shadow: var(--box-shadow);
}

.large-card.rounded-sm {
    border-radius: var(--border-radius-sm);
}

.large-card.rounded {
    border-radius: var(--border-radius);
}
</style>