<script setup lang="ts">
import { t } from 'i18next';
import type { ContentVideo } from '@/types/template-content';

import { useCookieConsentStore } from '@/stores/cookie-consent';
import OnOffButton from '../ui/OnOffButton.vue';

const consentStore = useCookieConsentStore();

const props = defineProps<{
  video: ContentVideo
}>();

import { useRouter } from 'vue-router';

const router = useRouter();

const handleLinkClick = (event: Event) => {
  const target = event.target as HTMLElement;
  if (target.tagName === 'A' && target.getAttribute('href')?.startsWith('/')) {
    event.preventDefault();
    const href = target.getAttribute('href');
    if (href) {
      router.push(href);
    }
  }
};

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
  <div class="video-embed-container">
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
      <div v-else class="video-placeholder-container">
        <div class="video-provider-logo">
          <img src="/images/logos/Vimeo_Logo.svg" />
        </div>
        <div class="video-placeholder-statement">
          <div>
            <p v-html="t('privacySettings.vimeoDescriptionShort')"></p>
            <p @click="handleLinkClick" v-html="t('privacySettings.rejectText')"></p>
          </div>
          <div>
            <OnOffButton
              :label="t('privacySettings.vimeoToggleLabel')"
              :model-value="consentStore.hasVimeoConsent"
              @update:model-value="consentStore.handleVimeoToggle($event)"
            />
          </div>
        </div>
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
      <div v-else class="video-placeholder-container">
        <div class="video-provider-logo">
          <img src="/images/logos/yt_logo_fullcolor_white_digital.png" />
        </div>
        <div class="video-placeholder-statement">
          <div>
            <p v-html="t('privacySettings.youtubeDescriptionShort')"></p>
            <p @click="handleLinkClick" v-html="t('privacySettings.rejectText')"></p>
          </div>
          <div>
            <OnOffButton
              :label="t('privacySettings.youtubeToggleLabel')"
              :model-value="consentStore.hasYoutubeConsent"
              @update:model-value="consentStore.handleYoutubeToggle($event)"
            />
          </div>
        </div>
      </div>
    </div>
    
    <!-- Fallback for other types -->
    <div v-else>
      <p>Unsupported video type: {{ video.videoType }}</p>
      <a :href="video.url" target="_blank" rel="noopener">Open video in new tab</a>
    </div>
  </div>
</template>

<style scoped>
.video-embed-container {
  width: 100%;
  aspect-ratio: 16/9;
}

.video-embed-container > div {
  height: 100%;
}

.video-placeholder-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
  gap: var(--size-xxl);
  background: #000;
  color: rgb(200,200,200);
  padding: var(--size-xxl);
}

.video-placeholder-statement {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--size-xxl);
}

.video-provider-logo {
  width: 100%;
  text-align: left;
}

.video-provider-logo img {
  height: 48px;
  width: auto;
}

iframe, video {
  aspect-ratio: 16/9;
  width: 100%;
  height: auto;
}


/* Make links readable on black background */
.video-embed-container :deep(a) {
  color: #4da6ff; /* Light blue for better contrast */
}

.video-embed-container :deep(a:visited) {
  color: #4da6ff; /* Same as unvisited */
}

.video-embed-container :deep(a:hover) {
  color: #80bfff; /* Lighter blue on hover */
}

.video-embed-container :deep(a:active) {
  color: #4da6ff; /* Same as unvisited */
}
</style>