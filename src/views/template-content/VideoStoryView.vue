<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import type { Page } from 'localcosmos-client';
import type { ContentVideo } from '@/types/template-content';
import { useTemplateContent } from '@/composables/useTemplateContent';
import type { TemplateContentSource } from '@/composables/useTemplateContent';
import TemplateContentContainer from '@/components/container/TemplateContentContainer.vue';
import VideoEmbed from '@/components/video/VideoEmbed.vue';
import LargeCard from '@/components/container/LargeCard.vue';
import { useRouter } from 'vue-router';


const router = useRouter();
const { fetchTemplateContent } = useTemplateContent();

const loading = ref<boolean>(true);

const route = useRoute();
const slug = route.params.slug as string; 
const templateData = ref<Page| null>(null);
const templateSource = ref<TemplateContentSource | null>(null);


const video = ref<ContentVideo | null>(null);

onMounted(async() => {
  const result = await fetchTemplateContent(slug);
  templateData.value = result.templateData;
  templateSource.value = result.source;
  if (templateData.value) {
    video.value = templateData.value.contents.video || null;
  }
  else {
    // 404 Not Found
    router.replace({ name: 'not-found' });
  }
  loading.value = false;
});
</script>

<template>
  <TemplateContentContainer :loading="loading" class="video-story">
    <div v-if="templateData" class="container video-story__container">
      <LargeCard class="pb-2xl page-padding-y">
        <div class="container-md sm-page-padding-x">
          <div class="py-2xl">
          <h1 class="mt-2xl">{{ templateData.title }}</h1>
          </div>
        </div>
        <div class="mt-xl">
            <VideoEmbed v-if="video" :video="video" :autoplay="true"/>
            <div v-else class="text-center text-gray-500">No video available</div>
        </div>
      </LargeCard>
    </div>
  </TemplateContentContainer>
</template>

<style>
@layer defaults {
  :root {
    --video-story-bg: var(--bg-translucent);
    --video-story-container-bg: #FFF;

    --darkmode-video-story-bg: rgba(0, 0, 0, 0.5);
    --darkmode-video-story-container-bg: rgba(0, 0, 0, 1);
  }
}

.video-story {
  background: var(--video-story-bg);
}

body.dark .video-story {
  background: var(--darkmode-video-story-bg);
}

.video-story__container {
  background: var(--video-story-container-bg);
}

body.dark .video-story__container {
  background: var(--darkmode-video-story-container-bg);
}

/* Tablet and up: image right, text left */
@media (min-width: 768px) {

}

@media (min-width: 640px) {
}

@media (min-width: 1024px) {

}

@media (min-width: 1280px) {

}

@media (min-width: 1536px) {

}
</style>