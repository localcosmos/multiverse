<script setup lang="ts">
import type { Heading } from '@/types/template-content';

const props = defineProps<{
  heading: Heading
}>();
</script>

<template>
  <h2 class="text-heading" v-html="heading.heading"></h2>
</template>

<style scoped>
</style>