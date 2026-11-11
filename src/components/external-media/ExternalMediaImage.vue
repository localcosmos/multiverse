<script setup lang="ts">
import type { ExternalMedia } from "localcosmos-client";
import ExternalMediaAuthor from "./ExternalMediaAuthor.vue";
import ExternalMediaCard from "./ExternalMediaCard.vue";
import ExternalMediaTitle from "./ExternalMediaTitle.vue";

const props = defineProps<{
  item: ExternalMedia;
}>();
</script>

<template>
  <ExternalMediaCard :item="props.item">
    <template #title>
      <ExternalMediaTitle :item="props.item" />
    </template>

    <template #preview>
      <img
        v-if="props.item.url"
        :src="props.item.url"
        :alt="props.item.altText || props.item.title || 'External media'"
        loading="lazy"
        class="external-media-image"
      />
    </template>

    <template #author>
      <ExternalMediaAuthor :item="props.item" :apply-link="true" />
    </template>
  </ExternalMediaCard>
</template>

<style scoped>
.external-media-image {
  display: block;
  width: 100%;
  height: auto;
  object-fit: cover;
  border-radius: 0.75rem;
}
</style>
