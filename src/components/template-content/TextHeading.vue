<script setup lang="ts">
import type { Heading } from '@/types/template-content';

const props = defineProps<{
  heading: Heading
}>();
</script>

<template>
  <div class="page-padding-x pb-lg">
    <h2 class="h2" v-html="heading.heading"></h2>
  </div>
</template>

<style scoped>
</style>