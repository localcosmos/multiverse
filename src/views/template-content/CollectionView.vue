<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import type { ImageWithTextAndLicence, Page, TemplateContentLink } from 'localcosmos-client';
import { useTemplateContent } from '@/composables/useTemplateContent';
import type { TemplateContentSource } from '@/composables/useTemplateContent';
import TemplateContentContainer from '@/components/container/TemplateContentContainer.vue';

import { useRouter } from 'vue-router';

import ColorButton from '@/components/ui/ColorButton.vue';
import { backgroundImageStyle } from '@/utils/backgroundImageStyle';

const router = useRouter();
const { fetchTemplateContent, getImagePath, templateContentImageUrl } = useTemplateContent();

const loading = ref<boolean>(true);

const route = useRoute();
const templateData = ref<Page| null>(null);
const templateSource = ref<TemplateContentSource | null>(null);

type ArticlePreview = {
  image?: ImageWithTextAndLicence;
  abstract?: string;
  article: TemplateContentLink;
  linkName: string;
}

const articles = ref<ArticlePreview[]>([]);
const articleAbstracts = ref<Record<string, string>>({});
const articleImages = ref<Record<string, string | null>>({});
const articleImageSource = ref<Record<string, TemplateContentSource | null>>({});
const featuredImage = ref<string | null>(null);

const createBackgroundImageStyle = (slug: string): Record<string, string> =>
  backgroundImageStyle(articleImages.value[slug] ?? null, articleImageSource.value[slug] ?? null, templateContentImageUrl);

const loadCollection = async (slug: string) => {
  const result = await fetchTemplateContent(slug);
  templateData.value = result.templateData;
  templateSource.value = result.source;

  if (templateData.value) {
    articles.value = templateData.value.contents.articlePreview || [];
    featuredImage.value = getImagePath(templateData.value.contents.featuredImage || null);
  }
  else {
    articles.value = [];
    featuredImage.value = null;
    // 404 Not Found
    router.replace({ name: 'not-found' });
  }

};


const truncateAbstract = (abstract: string): string => {
  return abstract.length > 200 ? abstract.slice(0, 200) + '...' : abstract;
};


const loadArticleAbstracts = async () => {
  articleAbstracts.value = {};

  const entries = await Promise.all(
    articles.value.map(async (article) => {
      const articleSlug = article.article?.slug;
      if (!articleSlug) {
        return null;
      }

      if (article.abstract) {
        // truncate the abstract to 200 characters
        const truncatedAbstract = truncateAbstract(article.abstract);
        return [articleSlug, truncatedAbstract] as const;
      }

      const result = await fetchTemplateContent(articleSlug);
      const articleData = result.templateData;
      const abstract = articleData?.contents?.abstract || articleData?.contents?.description || articleData?.contents?.text || '';
      // truncate the abstract to 200 characters
      const truncatedAbstract = truncateAbstract(abstract);
      return [articleSlug, truncatedAbstract] as const;
    })
  );

  articleAbstracts.value = Object.fromEntries(
    entries.filter((entry): entry is readonly [string, string] => entry !== null)
  );
};


const loadArticleImages = async () => {
  articleImages.value = {};
  articleImageSource.value = {};

  const entries = await Promise.all(
    articles.value.map(async (article) => {
      const articleSlug = article.article?.slug;
      if (!articleSlug) {
        return null;
      }

      const directImagePath = getImagePath(article.image || null);
      if (directImagePath) {
        return [articleSlug, { imagePath: directImagePath, source: templateSource.value }] as const;
      }

      const result = await fetchTemplateContent(articleSlug);

      const articleData = result.templateData;
      const image: ImageWithTextAndLicence | null = articleData?.contents?.previewImage || articleData?.contents?.featuredImage || null;

      let imageUrl: string | null = null;

      const imagePath = getImagePath(image);
      if (imagePath) {
        imageUrl = imagePath;
      }

      return [articleSlug, { imagePath: imageUrl, source: result.source }] as const;
    })
  );

  const validEntries = entries.filter(
    (entry): entry is readonly [string, { imagePath: string | null; source: TemplateContentSource | null }] => entry !== null
  );

  articleImages.value = Object.fromEntries(validEntries.map(([slug, data]) => [slug, data.imagePath]));
  articleImageSource.value = Object.fromEntries(validEntries.map(([slug, data]) => [slug, data.source]));
};

const getArticleAbstract = (slug: string) => {
  return articleAbstracts.value[slug] || '';
};

const loadAll = async (slug: unknown) => {
  if (typeof slug !== 'string' || !slug) {
    router.replace({ name: 'not-found' });
    return;
  }
  loading.value = true;
  try {
    await loadCollection(slug);
    await loadArticleAbstracts();
    await loadArticleImages();
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
            <RouterLink
              :to="article.article.url"
              class="nolinkstyle"
            >
              <div class="article-preview">
                <div
                  class="article-image"
                  :style="createBackgroundImageStyle(article.article.slug)"
                  role="img"
                  :aria-label="article.linkName"
                ></div>
                <div class="article-content">
                  <div class="article-title">
                    {{ article.linkName }}
                  </div>
                  <div v-if="article.article.author" class="article-author">
                    By {{ article.article.author }}
                  </div>
                  <div v-html="getArticleAbstract(article.article.slug)" class="article-abstract"></div>
                  <div class="mt-xl mb-md">
                    <ColorButton
                      text="READ NOW"
                      size="medium"
                      type="overlay"
                    >
                    </ColorButton>
                  </div>
                </div>
              </div>
            </RouterLink>
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
  gap: var(--gap-medium);
}

.article-preview {
  display: flex;
  flex-direction: column;
  gap: var(--gap-medium);
  align-items: stretch;
  background: #fff;
  transition:var(--transition-cubic);
}

.article-title {
  font-size: var(--font-size-2xl);
  font-family: var(--font-lusitana-1001);
  font-weight: 600;
}

.article-author {
  font-size: var(--font-size-lg);
  color: var(--color-neutral);
  font-family: var(--font-public-sans-1001);
  font-weight: 600;
}

.article-image {
  width: 100%;
  margin: 0 auto;
  aspect-ratio: 4 / 3;
  min-height: 180px;
  background-color: var(--color-neutral);
  background-image: var(--article-image-fallback);
  background-image: var(--article-image-set);
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  object-fit: cover;
}

.article-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex: 1 1 0%;
  gap: 0.5rem;
  padding: var(--size-lg) var(--size-xl);
  color: var(--color-neutral);
}

.article-link {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--color-link);
  text-decoration: none;
  margin-bottom: 0.25rem;
  word-break: break-word;
}

.article-abstract {
  margin: var(--size-lg) 0;
  color: var(--sea-change-dark-blue);
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

  .article-preview {
    gap: 2rem;
  }
  .article-content {
    flex: 1 1 0%;
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
