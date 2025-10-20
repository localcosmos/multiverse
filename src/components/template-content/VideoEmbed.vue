<script setup lang="ts">
import type { ContentVideo } from '@/types/template-content';

import { useCookieConsentStore } from '@/stores/cookie-consent';
const consentStore = useCookieConsentStore();

const props = defineProps<{
  video: ContentVideo
}>();

// Function to extract video ID from different platforms
const getEmbedUrl = (url: string, videoType: string) => {
  if (videoType === 'Vimeo') {
    // Extract Vimeo ID from URL like https://vimeo.com/123456789
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}?dnt=1`;
    }
    // If it's already just the ID
    return `https://player.vimeo.com/video/${url}?dnt=1`;
  }
  
  if (videoType === 'YouTube') {
    // Extract YouTube ID from various URL formats
    let videoId = '';
    
    // https://www.youtube.com/watch?v=VIDEO_ID
    const youtubeMatch1 = url.match(/[?&]v=([^&#]*)/);
    if (youtubeMatch1) videoId = youtubeMatch1[1];
    
    // https://youtu.be/VIDEO_ID
    const youtubeMatch2 = url.match(/youtu\.be\/([^?&#]*)/);
    if (youtubeMatch2) videoId = youtubeMatch2[1];
    
    // https://www.youtube.com/embed/VIDEO_ID
    const youtubeMatch3 = url.match(/youtube\.com\/embed\/([^?&#]*)/);
    if (youtubeMatch3) videoId = youtubeMatch3[1];
    
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}`;
    }
    // If it's already just the ID
    return `https://www.youtube.com/embed/${url}`;
  }
  
  // For direct video URLs (mp4, webm, etc.)
  if (videoType === 'Direct') {
    return url;
  }
  
  return url;
};
</script>

<template>
  <div>
    <!-- Vimeo -->
    <div v-if="video.videoType === 'Vimeo'">
      <iframe
        v-if="consentStore.hasVimeoConsent"
        :src="getEmbedUrl(video.url, 'Vimeo')"
        width="100%"
        height="360"
        frameborder="0"
        allow="autoplay; fullscreen; picture-in-picture"
        allowfullscreen
        title="Embedded Vimeo video"
      ></iframe>
      <div v-else>
        <p>This video is hosted on Vimeo. Please provide consent to load the video.</p>
        <button @click="consentStore.acceptVimeo()">Accept Vimeo Cookies</button>
      </div>
    </div>
    
    <!-- YouTube -->
    <div v-else-if="video.videoType === 'YouTube'">
      <iframe
        v-if="consentStore.hasYoutubeConsent"
        :src="getEmbedUrl(video.url, 'YouTube')"
        width="100%"
        height="360"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen
        title="Embedded YouTube video"
      ></iframe>
      <div v-else>
        <p>This video is hosted on YouTube. Please provide consent to load the video.</p>
        <button @click="consentStore.acceptYoutube()">Accept YouTube Cookies</button>
      </div>
    </div>
    
    <!-- Direct video file -->
    <div v-else-if="video.videoType === 'Direct'">
      <video
        :src="video.url"
        width="100%"
        height="360"
        controls
        preload="metadata"
      >
        Your browser does not support the video tag.
      </video>
    </div>
    
    <!-- Fallback for other types -->
    <div v-else>
      <p>Unsupported video type: {{ video.videoType }}</p>
      <a :href="video.url" target="_blank" rel="noopener">Open video in new tab</a>
    </div>
  </div>
</template>

<style scoped>
iframe, video {
  aspect-ratio: 16/9;
  width: 100%;
  height: auto;
}
</style>