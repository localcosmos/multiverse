<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import type { ImageWithTextAndLicence, Page, TemplateContentLink } from 'localcosmos-client';
import { fetchTemplateContent } from '@/composables/fetchTemplateContent';
import TemplateContentContainer from '@/components/container/TemplateContentContainer.vue';
import { templateContentImageUrlsToSrcSet } from '@/composables/templateContentImageUrlsToSrcSet';
import { useRouter } from 'vue-router';
const router = useRouter();

const loading = ref<boolean>(true);

const route = useRoute();
const slug = route.params.slug as string; 
const templateData = ref<Page| null>(null);

type ArticlePreview = {
  image?: ImageWithTextAndLicence;
  abstract?: string;
  article: TemplateContentLink;
  linkName: string;
}

const articles = ref<ArticlePreview[]>([]);

onMounted(async() => {
  templateData.value  = await fetchTemplateContent(slug);
  if (templateData.value) {
    articles.value = templateData.value.contents.articlePreview || [];
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
    <div v-if="templateData" class="container page-padding">
      <div>
        <h1>{{ templateData.title }}</h1>
      </div>
      <div class="mt-xl">
        <div v-if="templateData.contents.description" v-html="templateData.contents.description" class="paragraph-text my-xl"></div>
        <div
          v-for="(article, counter) in articles"
          :key="counter"
        >
          <RouterLink
            :to="article.article.url"
            class="nolinkstyle"
          >
            <div class="article-preview">
              <div v-if="article.image" class="article-image">
                <img
                  :src="article.image.imageUrl['2x']"
                  :srcset="templateContentImageUrlsToSrcSet(article.image.imageUrl)"
                  :sizes="'(min-width: 768px) 180px, 100vw'"
                  :alt="article.linkName"
                />
              </div>
              <div class="article-content">
                <div class="article-title">
                  {{ article.linkName }}
                </div>
                <div v-if="article.abstract" v-html="article.abstract" class="paragraph-text"></div>
              </div>
            </div>
          </RouterLink>
        </div>
      </div>
    </div>
  </TemplateContentContainer>
</template>

<style scoped>
.article-preview {
  display: flex;
  flex-direction: column;
  gap: var(--gap-medium);
  align-items: stretch;
  margin-bottom: var(--size-md);
  background: #fff;
  border-radius: var(--border-radius-sm, 12px);
  box-shadow: var(--box-shadow);
  padding: var(--size-md);
  transition:var(--transition-cubic);
}

.article-title {
  font-size: var(--font-size-xxl);
}

.article-preview:hover {
  box-shadow: var(--box-shadow-hover);
}

.article-image {
  width: 100%;
  margin: 0 auto;
}

.article-image img {
  width: 100%;
  height: auto;
  border-radius: var(--border-radius-xs);
  display: block;
  object-fit: cover;
}

.article-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex: 1 1 0%;
  gap: 0.5rem;
}

.article-link {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--color-link, #007bff);
  text-decoration: none;
  margin-bottom: 0.25rem;
  word-break: break-word;
}

.paragraph-text {
  margin: 0;
}

@media (min-width: 640px) {
}

/* Tablet and up: image left, text right */
@media (min-width: 768px) {
  .article-preview {
    flex-direction: row;
    align-items: flex-start;
    gap: 2rem;
  }
  .article-image {
    flex: 0 0 250px;
    max-width: 250px;
    margin: 0;
  }
  .article-content {
    flex: 1 1 0%;
  }
}

@media (min-width: 1024px) {

}

@media (min-width: 1280px) {

}

@media (min-width: 1536px) {

}
</style>