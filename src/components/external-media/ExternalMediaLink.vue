<script setup lang="ts">
import type { ExternalMedia } from "localcosmos-client";
import ExternalMediaAuthor from "./ExternalMediaAuthor.vue";
import ExternalMediaCard from "./ExternalMediaCard.vue";
import ExternalMediaWebsiteTitle from "./ExternalMediaWebsiteTitle.vue";

const props = defineProps<{
  item: ExternalMedia;
}>();
</script>

<template>
  <ExternalMediaCard :item="props.item">
    <template #title>
      <ExternalMediaWebsiteTitle :item="props.item" />
    </template>
    <template #author>
      <ExternalMediaAuthor :item="props.item" :apply-link="false" />
    </template>
  </ExternalMediaCard>
</template>

<style scoped></style>
