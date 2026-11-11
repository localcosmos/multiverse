<script setup lang="ts">
import type { ExternalMedia } from "localcosmos-client";
import { PhArrowSquareOut } from "@phosphor-icons/vue";

const props = defineProps<{
  item: ExternalMedia;
}>();
</script>

<template>
  <a
    v-if="props.item.url"
    :href="props.item.url"
    target="_blank"
    rel="noopener noreferrer"
    class="external-media-title-link"
  >
    <strong class="external-media-title-text">{{ props.item.title || props.item.url }}</strong>
    <PhArrowSquareOut class="external-media-title-icon" :size="18" />
  </a>
</template>

<style>
@layer defaults {
  :root {
    --external-media-website-title-color: var(--external-media-card-color);
    --darkmode-external-media-website-title-color: #FFF;
  }
}
.external-media-title-link,
.external-media-title-link:visited {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  min-height: 2.25rem;
  font-size: var(--font-size-xl);
  color: var(--external-media-website-title-color);
  text-decoration: none;
}

body.dark .external-media-title-link,
body.dark .external-media-title-link:visited {
  color: var(--darkmode-external-media-website-title-color);
  text-decoration: none;
}

.external-media-title-text {
  line-height: 1.2;
}

.external-media-title-icon {
  flex-shrink: 0;
  line-height: 1;
}
</style>
