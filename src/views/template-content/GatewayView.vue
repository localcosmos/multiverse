<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import type { ImageWithTextAndLicence, Page, TemplateContentLink } from 'localcosmos-client';
import { useTemplateContent } from '@/composables/useTemplateContent';
import type { TemplateContentSource } from '@/composables/useTemplateContent';
import TemplateContentContainer from '@/components/container/TemplateContentContainer.vue';
import { backgroundImageStyle } from '@/utils/backgroundImageStyle';

import { useRouter } from 'vue-router';

const router = useRouter();
const { fetchTemplateContent, getImagePath, templateContentImageUrl } = useTemplateContent();

const loading = ref<boolean>(true);

const route = useRoute();
const templateData = ref<Page| null>(null);
const templateSource = ref<TemplateContentSource | null>(null);

type GatewayLink = {
  image?: ImageWithTextAndLicence;
  pageLink: TemplateContentLink;
  linkName: string;
}

const pageLinks = ref<GatewayLink[]>([]);
const teaserImages = ref<Record<string, string | null>>({});
const teaserImageSource = ref<Record<string, TemplateContentSource | null>>({});

const createBackgroundImageStyle = (slug: string): Record<string, string> =>
  backgroundImageStyle(teaserImages.value[slug] ?? null, teaserImageSource.value[slug] ?? null, templateContentImageUrl);

const loadGatewayLinks = async (slug: string) => {
  const result = await fetchTemplateContent(slug);
  templateData.value = result.templateData;
  templateSource.value = result.source;
  if (templateData.value) {
    pageLinks.value = templateData.value.contents.pageLink || [];
  }
  else {
    pageLinks.value = [];
    // 404 Not Found
    router.replace({ name: 'not-found' });
  }

};


const loadTeaserImages = async () => {
  teaserImages.value = {};
  teaserImageSource.value = {};

  const entries = await Promise.all(
    pageLinks.value.map(async (page) => {
      const pageSlug = page.pageLink?.slug;
      if (!pageSlug) {
        return null;
      }

      const directImagePath = getImagePath(page.image || null);
      if (directImagePath) {
        return [pageSlug, { imagePath: directImagePath, source: templateSource.value }] as const;
      }

      const result = await fetchTemplateContent(pageSlug);
      const pageData = result.templateData;
      const pageSource = result.source;
      const image: ImageWithTextAndLicence | null = pageData?.contents?.featuredImage || null;

      let imageUrl: string | null = null;

      const imagePath = getImagePath(image);
      if (imagePath) {
        imageUrl = imagePath;
      }

      return [pageSlug, { imagePath: imageUrl, source: pageSource }] as const;
    })
  );

  const validEntries = entries.filter(
    (entry): entry is readonly [string, { imagePath: string | null; source: TemplateContentSource | null }] => entry !== null
  );

  teaserImages.value = Object.fromEntries(validEntries.map(([slug, data]) => [slug, data.imagePath]));
  teaserImageSource.value = Object.fromEntries(validEntries.map(([slug, data]) => [slug, data.source]));
};

const loadAll = async (slug: unknown) => {
  if (typeof slug !== 'string' || !slug) {
    router.replace({ name: 'not-found' });
    return;
  }
  loading.value = true;
  try {
    await loadGatewayLinks(slug);
    await loadTeaserImages();
  }
  finally {
    loading.value = false;
  }
};

onMounted(() => loadAll(route.params.slug));
</script>

<template>
  <TemplateContentContainer :loading="loading" class="gateway">
    <div v-if="templateData" class="desktop-header-padding-top">
      <div class="container gateway__container page-padding-y">
        <div class="gateway-links-container page-padding-x">
            <div
              v-for="(page, index) in pageLinks"
              :key="index"
            >
              <RouterLink
                :to="page.pageLink.url"
                class="nolinkstyle"
              >
                <div
                  class="gateway-link"
                >
                  <div
                    class="gateway-link-image"
                    :style="createBackgroundImageStyle(page.pageLink.slug)"
                    role="img"
                    :aria-label="page.linkName"
                  ></div>
                  <div class="gateway-image-overlay"></div>
                  <div class="gateway-link-text">
                    <div>
                      {{ page.linkName }}
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

<style>
@layer defaults {
  :root {
    --gateway-bg: var(--bg-translucent);
    --gateway-container-bg: rgba(255,255,255, 1);

    --darkmode-gateway-bg: rgba(0, 0, 0, 0.5);
    --darkmode-gateway-container-bg: rgba(0, 0, 0, 1);
  }
}

.gateway {
  background: var(--gateway-bg);
}

.gateway__container {
  background: var(--gateway-container-bg);
}

body.dark .gateway {
  background: var(--darkmode-gateway-bg);
}

body.dark .gateway__container {
  background: var(--darkmode-gateway-container-bg);
}

.gateway-links-container {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--size-xl);
  margin: 0 auto;
}

.gateway-link {
  display: flex;
  flex-direction: column;
  gap: var(--size-sm);
  align-items: center;
  justify-content: center;
  background: var(--color-neutral);
  transition:var(--transition-cubic);
  aspect-ratio: 16 / 8;
  position: relative;
}

.gateway-link-title {
  font-size: var(--font-size-2xl);
  font-family: var(--font-lusitana-1001);
  font-weight: 600;
}

.gateway-link-image {
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

.gateway-image-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(circle at center, rgba(0, 0, 0, 0.2) 20%, rgba(0, 0, 0, 0.68) 100%);
  z-index: 0;
}

.gateway-link-text {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--size-xl);
  text-align: center;
  color: #FFFFFF;
  font-family: var(--font-lusitana-1001);
  font-size: var(--font-size-2xl);
  font-weight: 600;
}

@media (min-width: 640px) {
  .gateway-links-container {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Tablet and up: image left, text right */
@media (min-width: 768px) {

  .gateway-links-container {
    grid-template-columns: repeat(2, 1fr);
  }

}

@media (min-width: 1024px) {

}

@media (min-width: 1280px) {
  .gateway-links-container {
    grid-template-columns: repeat(3, 1fr);
  }

}

@media (min-width: 1536px) {

}
</style>
