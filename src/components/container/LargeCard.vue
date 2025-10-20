<script setup lang="ts"></script>
<template>
    <div class="large-card">
        <slot />
    </div>
</template>

<style scoped>
.large-card {
    border-radius: var(--border-radius);
    padding: var(--size-xl) var(--size-md);
    background-color: rgba(255, 255, 255, 0.75);
}
</style>