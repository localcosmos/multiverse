<script setup lang="ts">
import type { ContentVideo } from '@/types/template-content';
import VideoEmbed from '@/components/video/VideoEmbed.vue';

const props = defineProps<{
  video: ContentVideo | null
}>();
</script>

<template>
  <div class="">
    <VideoEmbed v-if="video" :video="video" />
    <div v-else class="text-center text-gray-500">No video available</div>
  </div>
</template>

<style scoped>
</style>