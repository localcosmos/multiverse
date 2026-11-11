<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import type { ImageWithTextAndLicence, Page, TemplateContentLink } from 'localcosmos-client';
import { useTemplateContent } from '@/composables/useTemplateContent';
import type { TemplateContentSource } from '@/composables/useTemplateContent';
import TemplateContentContainer from '@/components/container/TemplateContentContainer.vue';
import { backgroundImageStyle } from '@/utils/backgroundImageStyle';
import ShortStoryPreview from '@/components/template-content/ShortStoryPreview.vue';

import { useRouter } from 'vue-router';

const router = useRouter();
const { fetchTemplateContent, getImagePath, templateContentImageUrl } = useTemplateContent();

const loading = ref<boolean>(true);

const route = useRoute();
const templateData = ref<Page| null>(null);
const templateSource = ref<TemplateContentSource | null>(null);

type TaxonArticleLink = {
  image?: ImageWithTextAndLicence;
  pageLink: TemplateContentLink;
  linkName: string;
  author?: string;
  imageText?: string; // fallback: fetched article contents.number
  scientificName?: string; // fallback: fetched article contents.scientificName
}

const articles = ref<TaxonArticleLink[]>([]);
const articleImages = ref<Record<string, string | null>>({});
const articleImageSource = ref<Record<string, TemplateContentSource | null>>({});
const featuredImage = ref<string | null>(null);

const isBlank = (value?: string): boolean => value == null || value.trim() === '';

const createBackgroundImageStyle = (slug: string): Record<string, string> =>
  backgroundImageStyle(articleImages.value[slug] ?? null, articleImageSource.value[slug] ?? null, templateContentImageUrl);

const loadCollection = async (slug: string) => {

  const result = await fetchTemplateContent(slug);
  templateData.value = result.templateData;
  templateSource.value = result.source;

  if (templateData.value) {
    articles.value = templateData.value.contents.taxonArticleLink || [];
    featuredImage.value = getImagePath(templateData.value.contents.featuredImage || null);
  }
  else {
    articles.value = [];
    featuredImage.value = null;
    // 404 Not Found
    router.replace({ name: 'not-found' });
  }

};

const loadArticlePreviewData = async () => {
  articleImages.value = {};
  articleImageSource.value = {};

  const articleResults = await Promise.all(
    articles.value.map(async (article) => {
      const articleSlug = article.pageLink?.slug;
      if (!articleSlug) {
        return {
          slug: null,
          imageUrl: null,
          article,
        };
      }

      const directImagePath = getImagePath(article.image || null);
      const needsFallbackImageText = isBlank(article.imageText);
      const needsFallbackScientificName = isBlank(article.scientificName);
      const needsFetch = !directImagePath || needsFallbackImageText || needsFallbackScientificName;

      let articleData: Page | null = null;
      let fetchedSource: TemplateContentSource | null = null;
      if (needsFetch) {
        const result = await fetchTemplateContent(articleSlug);
        articleData = result.templateData;
        fetchedSource = result.source;
      }

      let imagePath: string | null = null;
      let imageSource: TemplateContentSource | null = null;
      if (directImagePath) {
        imagePath = directImagePath;
        imageSource = templateSource.value;
      }
      else {
        const image: ImageWithTextAndLicence | null = articleData?.contents?.previewImage || articleData?.contents?.featuredImage || null;
        imagePath = getImagePath(image);
        imageSource = fetchedSource;
      }

      const articleWithFallbacks: TaxonArticleLink = { ...article };

      if (needsFallbackImageText) {
        const fallbackNumber = articleData?.contents?.number;
        if (fallbackNumber != null) {
          articleWithFallbacks.imageText = String(fallbackNumber);
        }
      }

      if (needsFallbackScientificName) {
        const fallbackScientificName = articleData?.contents?.scientificName;
        if (!isBlank(fallbackScientificName)) {
          articleWithFallbacks.scientificName = fallbackScientificName;
        }
      }

      return {
        slug: articleSlug,
        imagePath,
        imageSource,
        article: articleWithFallbacks,
      };
    })
  );

  articles.value = articleResults.map((result) => result.article);

  const validResults = articleResults.filter(
    (result): result is { slug: string; imagePath: string | null; imageSource: TemplateContentSource | null; article: TaxonArticleLink } => result.slug !== null
  );

  articleImages.value = Object.fromEntries(validResults.map((result) => [result.slug, result.imagePath]));
  articleImageSource.value = Object.fromEntries(validResults.map((result) => [result.slug, result.imageSource]));
};


const loadAll = async (slug: unknown) => {
  if (typeof slug !== 'string' || !slug) {
    router.replace({ name: 'not-found' });
    return;
  }
  loading.value = true;
  try {
    await loadCollection(slug);
    await loadArticlePreviewData();
  }
  finally {
    loading.value = false;
  }
};

onMounted(() => loadAll(route.params.slug));
</script>

<template>
  <TemplateContentContainer :loading="loading" class="bg-translucent">
    <div v-if="templateData">
      <div class="rail-padding">
        <div
          class="featured-image"
          :style="{
            backgroundImage: featuredImage
              ? `url(${templateContentImageUrl(featuredImage, templateSource)})`
              : 'none'
          }"
        >
          <div class="featured-image-overlay"></div>
          <div class="collection-title">
            <h1>{{ templateData.title }}</h1>
            <div v-if="templateData.contents.description" class="collection-description mt-md" v-html="templateData.contents.description"></div>
          </div>

        </div>
      </div>
      <div class="container page-padding bg-grey">
        <div class="article-list bg-grey">
          <div
            v-for="(article, counter) in articles"
            :key="counter"
          >
            <ShortStoryPreview
              :to="article.pageLink.url"
              :title="article.linkName"
              :scientific-name="article.scientificName"
              :image-text="article.imageText"
              :image-style="createBackgroundImageStyle(article.pageLink.slug)"
              :aria-label="article.linkName"
            />
          </div>
        </div>
      </div>
    </div>
  </TemplateContentContainer>
</template>

<style scoped>
.article-list {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--size-lg);
}

.featured-image {
  position: relative;
  overflow: hidden;
  width: 100%;
  height: 80vh;
  height: 80dvh;
  background-color: var(--color-neutral);
  background-size: cover;
  background-position: center;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-end;
}

.featured-image-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(circle at center, rgba(0, 0, 0, 0.2) 20%, rgba(0, 0, 0, 0.68) 100%);
  z-index: 0;
}

.collection-title {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: var(--size-xl);
  z-index: 1;
}

.collection-title h1 {
  color: #FFFFFF;
}

.collection-description {
  color: var(--sea-change-light-green);
}

@media (min-width: 640px) {
}

/* Tablet and up: image left, text right */
@media (min-width: 768px) {

  .article-list {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {

}

@media (min-width: 1280px) {
  .collection-description {
    font-size: var(--font-size-xl);
  }
}

@media (min-width: 1536px) {
  .article-list {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
