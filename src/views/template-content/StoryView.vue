<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import type { Page } from "localcosmos-client";
import type { ContentParagraph, ContentVideo } from "@/types/template-content";
import type { ImageWithTextAndLicence } from "localcosmos-client";
import { useTemplateContent } from "@/composables/useTemplateContent";
import type { TemplateContentSource } from "@/composables/useTemplateContent";
import TemplateContentContainer from "@/components/container/TemplateContentContainer.vue";
import ImagePreview from "@/components/images/ImagePreview.vue";
import VideoEmbed from "@/components/video/VideoEmbed.vue";
import LargeCard from "@/components/container/LargeCard.vue";
import LinkedTaxonProfilesList from "@/components/template-content/LinkedTaxonProfilesList.vue";
import { useRouter } from "vue-router";

const router = useRouter();
const { fetchTemplateContent, templateContentImageUrl } = useTemplateContent();

const loading = ref<boolean>(true);

const route = useRoute();
const slug = route.params.slug as string;
const templateData = ref<Page | null>(null);
const templateSource = ref<TemplateContentSource | null>(null);

const paragraphs = ref<ContentParagraph[]>([]);
const videos = ref<ContentVideo[]>([]);

const resolveImageUrl = (
  imageUrls: ImageWithTextAndLicence["imageUrl"] | undefined,
  size: "1x" | "2x" | "4x" | "8x",
): string | undefined => {
  if (!imageUrls) return undefined;
  const fallbackOrder = ["8x", "4x", "2x", "1x"] as const;
  const selectedPath =
    imageUrls[size] || fallbackOrder.map((s) => imageUrls[s]).find(Boolean);
  return selectedPath
    ? templateContentImageUrl(selectedPath, templateSource.value)
    : undefined;
};

onMounted(async () => {
  const result = await fetchTemplateContent(slug);
  templateData.value = result.templateData;
  templateSource.value = result.source;
  if (templateData.value) {
    paragraphs.value = (templateData.value.contents.paragraph || []).map(
      (p: ContentParagraph) => ({
        ...p,
        image: p.image
          ? {
              ...p.image,
              imageUrl: {
                "1x": resolveImageUrl(p.image.imageUrl, "1x"),
                "2x": resolveImageUrl(p.image.imageUrl, "2x"),
                "4x": resolveImageUrl(p.image.imageUrl, "4x"),
                "8x": resolveImageUrl(p.image.imageUrl, "8x"),
              },
            }
          : undefined,
      }),
    );
    videos.value = templateData.value.contents.videos || [];
  } else {
    // 404 Not Found
    router.replace({ name: "not-found" });
  }
  loading.value = false;
});
</script>

<template>
  <TemplateContentContainer :loading="loading" class="bg-translucent">
    <div v-if="templateData" class="container">
      <LargeCard class="pb-2xl page-padding-y">
        <div class="container-md sm-page-padding-x">
          <div class="py-2xl">
            <h1 class="mt-2xl">{{ templateData.title }}</h1>
          </div>
        </div>
        <div class="mt-xl">
          <div v-for="(video, counter) in videos" :key="counter">
            <VideoEmbed :video="video" />
          </div>
          <div class="container-md sm-page-padding-x">
            <div v-for="(paragraph, counter) in paragraphs" :key="counter">
              <h2 v-if="paragraph.heading" class="mt-xl">
                {{ paragraph.heading }}
              </h2>
              <div class="paragraph">
                <div v-html="paragraph.text" class="paragraph-text"></div>
                <div v-if="paragraph.image" class="paragraph-image">
                  <ImagePreview :image="paragraph.image" :show-caption="true" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div
          v-if="
            templateData.linkedTaxonProfiles &&
            templateData.linkedTaxonProfiles.length > 0
          "
          class="container-md sm-page-padding-x"
        >
          <div class="mb-2xl">
            <h2>{{ $t("templateContent.linkedTaxonProfiles") }}</h2>
            <LinkedTaxonProfilesList
              :linked-taxon-profiles="templateData.linkedTaxonProfiles"
              class="mt-2xl"
            />
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
