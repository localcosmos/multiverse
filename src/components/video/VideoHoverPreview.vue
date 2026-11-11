<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import type { ContentVideo } from '@/types/template-content';
import { useCookieConsentStore } from '@/stores/cookie-consent';

const props = defineProps<{
  video: ContentVideo;
  title?: string;
}>();

const consentStore = useCookieConsentStore();
const isHovering = ref(false);
const isIframeLoading = ref(false);

import { useVideoUrl } from '@/composables/useVideoUrl';

const { extractYoutubeId, extractVimeoId, extractVimeoHash, fetchVimeoThumbnail } = useVideoUrl();

const vimeoThumbnailSrc = ref<string | null>(null);

onMounted(async () => {
  if (props.video.videoType === 'Vimeo') {
    vimeoThumbnailSrc.value = await fetchVimeoThumbnail(props.video.url);
  }
});

const hasConsent = computed(() => {
  if (props.video.videoType === 'YouTube') {
    return consentStore.hasYoutubeConsent;
  }

  if (props.video.videoType === 'Vimeo') {
    return consentStore.hasVimeoConsent;
  }

  return true;
});

const previewSrc = computed(() => {
  if (props.video.videoType === 'YouTube') {
    const videoId = extractYoutubeId(props.video.url);
    if (!videoId) {
      return null;
    }

    return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&rel=0&modestbranding=1&playsinline=1&fs=0&disablekb=1&iv_load_policy=3`;
  }

  if (props.video.videoType === 'Vimeo') {
    const videoId = extractVimeoId(props.video.url);
    if (!videoId) {
      return null;
    }
    const hash = extractVimeoHash(props.video.url);
    const hashParam = hash ? `&h=${hash}` : '';
    return `https://player.vimeo.com/video/${videoId}?autoplay=1&muted=1&background=1&dnt=1&title=0&byline=0&portrait=0&autopause=0${hashParam}`;
  }

  return null;
});

const thumbnailSrc = computed(() => {
  if (props.video.videoType === 'YouTube') {
    const videoId = extractYoutubeId(props.video.url);
    if (!videoId) {
      return null;
    }
    return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  }

  if (props.video.videoType === 'Vimeo') {
    return vimeoThumbnailSrc.value;
  }

  return null;
});

const showIframe = computed(() => {
  return isHovering.value && hasConsent.value && Boolean(previewSrc.value);
});

const displayTitle = computed(() => {
  return props.title || props.video.title || 'Video';
});

const handleMouseEnter = () => {
  isHovering.value = true;

  if (props.video.videoType === 'Vimeo' && hasConsent.value && Boolean(previewSrc.value)) {
    isIframeLoading.value = true;
  }
};

const handleMouseLeave = () => {
  isHovering.value = false;
  isIframeLoading.value = false;
};

const handleIframeLoad = () => {
  isIframeLoading.value = false;
};
</script>

<template>
  <div
    class="hover-preview-card"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <div class="media-frame">
      <iframe
        v-if="showIframe && previewSrc"
        :src="previewSrc"
        frameborder="0"
        allow="autoplay; encrypted-media; picture-in-picture"
        allowfullscreen
        :title="displayTitle"
        @load="handleIframeLoad"
      ></iframe>

      <img
        v-else-if="thumbnailSrc"
        :src="thumbnailSrc"
        :alt="displayTitle"
        loading="lazy"
      />

      <div v-else class="fallback-thumbnail" aria-hidden="true">
        {{ video.videoType }}
      </div>

      <div v-if="!isHovering" class="play-overlay" aria-hidden="true">
        <span class="play-overlay-icon"></span>
      </div>

      <div
        v-if="isHovering && video.videoType === 'Vimeo' && isIframeLoading"
        class="loading-overlay"
        aria-hidden="true"
      >
        <span class="loading-spinner"></span>
      </div>

      <div v-if="!hasConsent" class="consent-chip">
        Enable {{ video.videoType }} cookies to preview
      </div>
    </div>

    <div class="meta">
      <h3>{{ displayTitle }}</h3>
    </div>
  </div>
</template>

<style scoped>
.hover-preview-card {
  display: flex;
  flex-direction: column;
  gap: var(--size-sm);
}

.media-frame {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  background: linear-gradient(135deg, #102a43 0%, #1f6f78 100%);
}

.media-frame iframe,
.media-frame img,
.fallback-thumbnail {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
}

.media-frame iframe {
  /* Let click events bubble to the parent RouterLink. */
  pointer-events: none;
}

.fallback-thumbnail {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #e5f6f8;
  letter-spacing: 0.04em;
  font-weight: 700;
}

.play-overlay,
.consent-chip,
.loading-overlay {
  position: absolute;
  z-index: 2;
}

.play-overlay {
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.play-overlay-icon {
  width: 4rem;
  height: 4rem;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.28);
  border: 2px solid rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(1px);
  position: relative;
}

.play-overlay-icon::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-38%, -50%);
  width: 0;
  height: 0;
  border-top: 0.62rem solid transparent;
  border-bottom: 0.62rem solid transparent;
  border-left: 1rem solid rgba(255, 255, 255, 0.92);
}

.loading-overlay {
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(16, 42, 67, 0.36);
}

.loading-spinner {
  width: 2.6rem;
  height: 2.6rem;
  border-radius: 999px;
  border: 3px solid rgba(255, 255, 255, 0.35);
  border-top-color: rgba(255, 255, 255, 0.95);
  animation: spin 0.75s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.consent-chip {
  top: 0.75rem;
  left: 0.75rem;
  border-radius: 999px;
  font-size: 0.75rem;
  line-height: 1;
  padding: 0.45rem 0.65rem;
  background: rgba(255, 248, 214, 0.95);
  color: #3d2e00;
}

.meta h3 {
  margin: 0;
  color: var(--color-neutral);
  font-size: var(--font-size-xl);
  font-family: var(--font-lusitana-1001);
}

.meta p {
  margin: 0;
  color: var(--sea-change-dark-blue);
  font-size: var(--font-size-sm);
  font-family: var(--font-public-sans-1001);
}
</style>
