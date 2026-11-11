<script setup lang="ts">
import type { ExternalMedia } from "localcosmos-client";
import ExternalMediaImage from "./ExternalMediaImage.vue";
import ExternalMediaVideo from "./ExternalMediaVideo.vue";
import ExternalMediaLink from "./ExternalMediaLink.vue";

const props = defineProps<{
  item: ExternalMedia;
}>();
</script>

<template>
  <ExternalMediaImage
    v-if="props.item.mediaType === 'image' && props.item.url"
    :item="props.item"
  />
  <ExternalMediaVideo
    v-else-if="['youtube', 'vimeo'].includes(props.item.mediaType) && props.item.url"
    :item="props.item"
  />
  <ExternalMediaLink
    v-else-if="['website', 'pdf', 'file'].includes(props.item.mediaType) && props.item.url"
    :item="props.item"
  />
</template>
