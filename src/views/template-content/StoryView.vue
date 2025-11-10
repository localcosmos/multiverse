<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import type { Page } from 'localcosmos-client';
import type { ContentParagraph, ContentVideo } from '@/types/template-content';
import { fetchTemplateContent } from '@/composables/fetchTemplateContent';
import TemplateContentContainer from '@/components/container/TemplateContentContainer.vue';
import ImageWithLicence from '@/components/images/ImageWithLicence.vue';
import VideoEmbed from '@/components/template-content/VideoEmbed.vue';
import LargeCard from '@/components/container/LargeCard.vue';
import { useRouter } from 'vue-router';
const router = useRouter();

const loading = ref<boolean>(true);

const route = useRoute();
const slug = route.params.slug as string; 
const templateData = ref<Page| null>(null);



const paragraphs = ref<ContentParagraph[]>([]);
const videos = ref<ContentVideo[]>([]);

onMounted(async() => {
  templateData.value  = await fetchTemplateContent(slug);
  if (templateData.value) {
    paragraphs.value = templateData.value.contents.paragraph || [];
    videos.value = templateData.value.contents.videos || [];
  }
  else {
    // 404 Not Found
    router.replace({ name: 'not-found' });
  }
  loading.value = false;
});
</script>

<template>
  <TemplateContentContainer :loading="loading">
    <div v-if="templateData" class="container page-padding-y">
      <LargeCard class="pb-xxl">
        <div class="container-md sm-page-padding-x">
          <div class="py-xxl">
          <h1 class="mt-xxl">{{ templateData.title }}</h1>
          </div>
        </div>
        <div class="mt-xl">
          <div v-for="(video, counter) in videos"
            :key="counter"
          >
            <VideoEmbed :video="video" />
          </div>
          <div class="container-md sm-page-padding-x">
            <div
              v-for="(paragraph, counter) in paragraphs"
              :key="counter"
            >
              <h2 v-if="paragraph.heading" class="mt-xl">{{ paragraph.heading }}</h2>
              <div class="paragraph">
                <div v-html="paragraph.text" class="paragraph-text"></div>
                <div v-if="paragraph.image" class="paragraph-image">
                  <ImageWithLicence
                    :image="paragraph.image"
                    :show-caption="true"
                    :is-template-content-image="true"
                    rounded="rounded"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </LargeCard>
    </div>
  </TemplateContentContainer>
</template>

<style scoped>
.paragraph {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 2rem;
}

.paragraph-text {
  flex: 1 1 0%;
  line-height: 1.5rem;
}

.paragraph-image {
  width: 100%;
  margin: 0 auto;
}

.paragraph-image img {
  width: 100%;
  height: auto;
  display: block;
  border-radius: var(--border-radius-sm, 12px);
  object-fit: cover;
}

/* Tablet and up: image right, text left */
@media (min-width: 768px) {
  .paragraph {
    gap: 2rem;
  }
  .paragraph-text {
    flex: 1 1 0%;
  }
  .paragraph-image {
    margin: 0;
  }
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