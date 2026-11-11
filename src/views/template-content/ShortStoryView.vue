<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import type { ImageWithTextAndLicence, Page } from "localcosmos-client";

import { useTemplateContent } from "@/composables/useTemplateContent";
import type { TemplateContentSource } from "@/composables/useTemplateContent";
import TemplateContentContainer from "@/components/container/TemplateContentContainer.vue";

import { useRouter } from "vue-router";
import { useLanguageStore } from "@/stores/language";

import { t } from "i18next";

import ImageMasonry from "@/components/images/ImageMasonry.vue";

import ColorButton from "@/components/ui/ColorButton.vue";

const router = useRouter();
const languageStore = useLanguageStore();
const { fetchTemplateContent, templateContentImageUrl } = useTemplateContent();

const loading = ref<boolean>(true);

const route = useRoute();
const slug = route.params.slug as string;
const templateData = ref<Page | null>(null);
const templateSource = ref<TemplateContentSource | null>(null);

const galleryImages = ref<ImageWithTextAndLicence[]>();

let date: string | null = null;

const resolveTemplateImageUrl = (
  imageUrls: ImageWithTextAndLicence["imageUrl"] | undefined,
  preferredSize: "1x" | "2x" | "4x" | "8x",
): string | undefined => {
  if (!imageUrls) {
    return undefined;
  }

  const fallbackOrder: Array<"8x" | "4x" | "2x" | "1x"> = ["8x", "4x", "2x", "1x"];
  const selectedPath =
    imageUrls[preferredSize] ||
    fallbackOrder.map((size) => imageUrls[size]).find((path) => Boolean(path));

  return selectedPath ? templateContentImageUrl(selectedPath, templateSource.value) : undefined;
};

const getProfileLinkText = (taxonLatname: string, taxonAuthor: string | null): string => {
  let scientificname = taxonLatname;
  if (taxonAuthor) {
    scientificname += ` ${taxonAuthor}`;
  }

  const vernacularName = t(scientificname);
  return `Species Profile of ${vernacularName}`;
};

onMounted(async () => {
  const result = await fetchTemplateContent(slug);
  templateData.value = result.templateData;
  templateSource.value = result.source;
  if (templateData.value) {
    if (templateData.value?.publishedAt || templateData.value?.lastModified) {
      date = new Date(
        templateData.value?.publishedAt || templateData.value?.lastModified,
      ).toLocaleDateString(languageStore.currentLanguage, {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }

    if (
      templateData.value.contents.imageGallery &&
      templateData.value.contents.imageGallery.length > 0
    ) {
      galleryImages.value = templateData.value.contents.imageGallery.map(
        (image: ImageWithTextAndLicence) => ({
          imageUrl: {
            "1x": resolveTemplateImageUrl(image.imageUrl, "1x"),
            "2x": resolveTemplateImageUrl(image.imageUrl, "2x"),
            "4x": resolveTemplateImageUrl(image.imageUrl, "4x"),
            "8x": resolveTemplateImageUrl(image.imageUrl, "8x"),
          },
          text: image.text,
          licence: image.licence,
        }),
      );
    }
  } else {
    // 404 Not Found
    router.replace({ name: "not-found" });
  }
  loading.value = false;
});
</script>

<template>
  <TemplateContentContainer :loading="loading" class="bg-translucent">
    <div v-if="templateData">
      <div class="rail-padding">
        <div
          class="featured-image"
          :style="{
            backgroundImage: templateData.contents.featuredImage
              ? `url(${resolveTemplateImageUrl(templateData.contents.featuredImage.imageUrl, '4x') || ''})`
              : 'none',
          }"
        >
          <div class="featured-image-overlay"></div>
          <div class="story-meta">
            <div>
              <div class="story-title">
                <h1>{{ templateData.title }}</h1>
              </div>
              <div v-if="templateData.contents.scientificName" class="story-scientific-name mb-md">
                <i>{{ templateData.contents.scientificName }}</i>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="container bg-solid page-padding-bottom">
        <div class="story-content-container pt-3xl">
          <div
            class="article-container leading-sentence px-2xl mb-2xl"
            v-if="templateData.contents.leadingSentence"
            v-html="templateData.contents.leadingSentence"
          ></div>
          <div class="article-container px-2xl" v-html="templateData.contents.text"></div>
        </div>
        <div v-if="templateData.linkedTaxonProfiles" class="linkedTaxaContainer">
          <div class="article-container mt-3xl px-2xl">
            <div
              v-for="(taxon, index) in templateData.linkedTaxonProfiles"
              :key="index"
              class="linkedTaxonProfile"
            >
              <RouterLink
                v-if="taxon.slug"
                :to="{ name: 'taxon-profile', params: { slug: taxon.slug } }"
                class="nolinkstyle"
              >
                <ColorButton
                  bg-color="var(--color-neutral)"
                  text-color="#fff"
                  :text="getProfileLinkText(taxon.taxonLatname, taxon.taxonAuthor)"
                >
                </ColorButton>
              </RouterLink>
            </div>
          </div>
        </div>
        <div class="story-gallery-container">
          <div class="article-container px-2xl mt-2xl">
            <ImageMasonry v-if="galleryImages" :images="galleryImages" :min-columns="2" :gap="16" />
          </div>
        </div>
      </div>
    </div>
  </TemplateContentContainer>
</template>

<style scoped>
.featured-image {
  position: relative;
  overflow: hidden;
  width: 100%;
  height: 90vh;
  height: 90dvh;
  background-color: var(--color-neutral);
  background-size: cover;
  background-position: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.featured-image-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(circle at center, rgba(0, 0, 0, 0.2) 20%, rgba(0, 0, 0, 0.68) 100%);
  z-index: 0;
}

.story-meta {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--size-xl);
}

.story-meta > div {
  position: relative;
  z-index: 1;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.story-scientific-name {
  font-style: italic;
  font-size: 20px;
  color: var(--sea-change-yellow);
  font-family: var(--font-sk-modernist-1001);
  margin-top: var(--size-md);
}

.story-content-container,
.story-gallery-container,
.linkedTaxaContainer {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
}

.story-content-container {
  padding-top: 100px;
}

.story-gallery-container {
  padding-top: 50px;
}

.story-date {
  color: var(--sea-change-yellow);
  font-size: 19px;
  font-family: var(--font-grotesque-1001);
  font-weight: 200;
  text-transform: uppercase;
}

.story-author {
  color: #ffffff;
  font-size: 19px;
  font-family: var(--font-grotesque-1001);
  text-transform: uppercase;
  font-weight: 800;
}

.story-title h1 {
  color: #ffffff;
}

.leading-sentence {
  font-weight: bold;
  font-size: 22px;
  color: var(--color-neutral);
  font-family: var(--font-lusitana-1001);
}

.masonry-item {
}

.masonry-item img {
  width: 100%;
  height: auto;
  display: block;
}

/* Tablet and up: image right, text left */
@media (min-width: 768px) {
}

@media (min-width: 640px) {
}

@media (min-width: 1024px) {
}

@media (min-width: 1280px) {
  .story-title h1 {
    font-size: 54px;
  }

  .story-scientific-name {
    font-size: 24px;
  }
}

@media (min-width: 1536px) {
}
</style>
