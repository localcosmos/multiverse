<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { t } from 'i18next';
import type { ContentVideo } from '@/types/template-content';
import { useCookieConsentStore } from '@/stores/cookie-consent';
import OnOffButton from '../ui/OnOffButton.vue';
import { useRouter } from 'vue-router';
import Player from '@vimeo/player';
import { useVideoUrl } from '@/composables/useVideoUrl';

const consentStore = useCookieConsentStore();

const props = withDefaults(defineProps<{
  video: ContentVideo,
  autoplay?: boolean,
}>(), {
  autoplay: false,
});

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

const { getEmbedUrl } = useVideoUrl();

// Vimeo Player SDK — data-vimeo-url with a player.vimeo.com URL bypasses the
// oEmbed lookup, so unlisted/restricted videos work just like a plain iframe.
const vimeoContainer = ref<HTMLDivElement | null>(null);
let vimeoPlayer: Player | null = null;

const youtubeEmbedUrl = computed(() => {
  const base = getEmbedUrl(props.video.url, 'YouTube');
  return props.autoplay ? `${base}&autoplay=1` : base;
});

const initVimeoPlayer = () => {
  if (!vimeoContainer.value || vimeoPlayer) return;
  vimeoPlayer = new Player(vimeoContainer.value, {
    responsive: true,
    autoplay: props.autoplay,
  });
  vimeoPlayer.on('ended', () => {
    vimeoPlayer?.setCurrentTime(0);
  });
};

const destroyVimeoPlayer = () => {
  if (vimeoPlayer) {
    vimeoPlayer.destroy();
    vimeoPlayer = null;
  }
};

onMounted(() => {
  if (props.video.videoType === 'Vimeo' && consentStore.hasVimeoConsent) {
    initVimeoPlayer();
  }
});

onBeforeUnmount(() => {
  destroyVimeoPlayer();
});

watch(
  () => consentStore.hasVimeoConsent,
  async (hasConsent) => {
    if (props.video.videoType !== 'Vimeo') return;
    if (!hasConsent) {
      destroyVimeoPlayer();
      return;
    }
    await nextTick();
    initVimeoPlayer();
  }
);
</script>

<template>
  <div class="video-embed-container">
    <!-- Vimeo -->
    <div v-if="video.videoType === 'Vimeo'">
      <div
        v-if="consentStore.hasVimeoConsent"
        ref="vimeoContainer"
        :data-vimeo-url="getEmbedUrl(video.url, 'Vimeo')"
      ></div>
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
        :src="youtubeEmbedUrl"
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
  /*aspect-ratio: 16/9;*/
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
  gap: var(--size-2xl);
  background: #000;
  color: rgb(200, 200, 200);
  padding: var(--size-2xl);
}

.video-placeholder-statement {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--size-2xl);
}

.video-provider-logo {
  width: 100%;
  text-align: left;
}

.video-provider-logo img {
  height: 48px;
  width: auto;
}

:deep(iframe), video {
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
