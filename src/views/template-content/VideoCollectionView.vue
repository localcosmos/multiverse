<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import type { Page, TemplateContentLink } from "localcosmos-client";
import { useTemplateContent } from "@/composables/useTemplateContent";
import type { TemplateContentSource } from "@/composables/useTemplateContent";
import type { ContentVideo } from "@/types/template-content";
import TemplateContentContainer from "@/components/container/TemplateContentContainer.vue";
import VideoHoverPreview from "@/components/video/VideoHoverPreview.vue";

import { useRouter } from "vue-router";

const router = useRouter();
const { fetchTemplateContent } = useTemplateContent();

const loading = ref<boolean>(true);

const route = useRoute();
const templateData = ref<Page | null>(null);
const templateSource = ref<TemplateContentSource | null>(null);

type VideoPreviewEntry = {
  video: TemplateContentLink;
  title?: string;
};

type VideoCollectionItem = {
  link: TemplateContentLink;
  title: string;
  video: ContentVideo;
};

const videos = ref<VideoCollectionItem[]>([]);

const inferVideoType = (url: string): ContentVideo["videoType"] | null => {
  if (url.includes("youtu.be") || url.includes("youtube.com")) {
    return "YouTube";
  }

  if (url.includes("vimeo.com")) {
    return "Vimeo";
  }

  return null;
};

const fetchVideo = async (entry: VideoPreviewEntry): Promise<ContentVideo | null> => {
  const videoSlug = entry.video?.slug;

  if (videoSlug) {
    const result = await fetchTemplateContent(videoSlug);
    const video = result.templateData?.contents?.video;

    if (video && typeof video.url === "string") {
      return video as ContentVideo;
    }
  }

  const fallbackUrl = entry.video?.url || "";
  const fallbackType = inferVideoType(fallbackUrl);

  if (!fallbackUrl || !fallbackType) {
    return null;
  }

  return {
    url: fallbackUrl,
    videoType: fallbackType,
    title: entry.title || "Video",
  };
};

const getSlugFromRouteParam = (slugParam: string | string[] | undefined): string | null => {
  if (Array.isArray(slugParam)) {
    return slugParam[0] ?? null;
  }

  return slugParam ?? null;
};

const loadVideos = async (slug: string) => {
  loading.value = true;

  const result = await fetchTemplateContent(slug);
  templateData.value = result.templateData;
  templateSource.value = result.source;

  if (templateData.value) {
    const rawVideoPreviews = templateData.value.contents.videoPreview;
    const videoPreviews = Array.isArray(rawVideoPreviews)
      ? (rawVideoPreviews as VideoPreviewEntry[])
      : rawVideoPreviews
        ? [rawVideoPreviews as VideoPreviewEntry]
        : [];
    const fetchedVideos = await Promise.all(
      videoPreviews.map(async (videoPreview) => {
        const video = await fetchVideo(videoPreview);
        if (!video) {
          return null;
        }

        return {
          link: videoPreview.video,
          title: videoPreview.title || video.title || "Video",
          video,
        };
      }),
    );
    videos.value = fetchedVideos.filter((video): video is VideoCollectionItem => video !== null);
  } else {
    videos.value = [];
    // 404 Not Found
    router.replace({ name: "not-found" });
  }

  loading.value = false;
};

onMounted(() => {
  const slug = getSlugFromRouteParam(route.params.slug);

  if (slug) {
    loadVideos(slug);
    return;
  }

  router.replace({ name: "not-found" });
});
</script>

<template>
  <TemplateContentContainer :loading="loading" class="bg-translucent">
    <div v-if="templateData" class="rail-padding">
      <div class="page-padding">
        <div class="mb-xl">
          <h1>{{ templateData.title }}</h1>
          <div
            v-if="templateData.contents.description"
            class="collection-description mt-md"
            v-html="templateData.contents.description"
          ></div>
        </div>
        <div class="video-grid">
          <div v-for="video in videos" :key="video.link.slug" class="video-preview">
            <RouterLink :to="video.link.url" class="nolinkstyle video-preview-link">
              <VideoHoverPreview :video="video.video" :title="video.title" />
            </RouterLink>
          </div>
        </div>
      </div>
    </div>
  </TemplateContentContainer>
</template>

<style scoped>
.video-preview-link {
  display: block;
}

.video-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--size-xl);
}

.video-preview {
  width: 100%;
}

@media (min-width: 640px) {
  .video-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

/* Tablet and up: image left, text right */
@media (min-width: 768px) {
  .video-grid {
    gap: var(--gap-large);
  }
}

@media (min-width: 1024px) {
  .video-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (min-width: 1280px) {
  .video-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

@media (min-width: 1536px) {
  .video-grid {
    grid-template-columns: repeat(5, minmax(0, 1fr));
  }
}
</style>
