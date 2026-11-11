<script setup lang="ts">
import { computed } from "vue";
import type { ExternalMedia } from "localcosmos-client";
import VideoEmbed from "@/components/video/VideoEmbed.vue";
import ExternalMediaAuthor from "./ExternalMediaAuthor.vue";
import ExternalMediaCard from "./ExternalMediaCard.vue";
import ExternalMediaTitle from "./ExternalMediaTitle.vue";

const props = defineProps<{
  item: ExternalMedia;
}>();

const videoType = computed(() => (props.item.mediaType === "youtube" ? "YouTube" : "Vimeo"));
</script>

<template>
  <ExternalMediaCard :item="props.item">
    <template #title>
      <ExternalMediaTitle :item="props.item" />
    </template>
    <template #preview>
      <div class="external-media-preview">
        <VideoEmbed
          v-if="props.item.url"
          :video="{
            url: props.item.url,
            videoType,
            title: props.item.title || props.item.url,
          }"
        />
      </div>
    </template>
    <template #author>
      <ExternalMediaAuthor :item="props.item" :apply-link="false" />
    </template>
  </ExternalMediaCard>
</template>

<style scoped>
.external-media-preview {
  border-radius: var(--border-radius);
  overflow: hidden;
}
</style>
