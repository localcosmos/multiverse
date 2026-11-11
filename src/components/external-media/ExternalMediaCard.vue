<script setup lang="ts">
import { computed } from "vue";
import type { ExternalMedia } from "localcosmos-client";
import { PhFile, PhFilePdf, PhGlobe, PhImage, PhPlayCircle } from "@phosphor-icons/vue";

const props = defineProps<{
  item: ExternalMedia;
}>();

const mediaTypeIcon = computed(() => {
  switch (props.item.mediaType as string) {
    case "image":
      return PhImage;
    case "youtube":
    case "vimeo":
      return PhPlayCircle;
    case "pdf":
      return PhFilePdf;
    case "file":
      return PhFile;
    default:
      return PhGlobe;
  }
});
</script>

<template>
  <div class="external-media-card">
    <div class="external-media-heading">
      <span class="external-media-type" :title="props.item.mediaType">
        <component :is="mediaTypeIcon" :size="28" weight="fill" />
      </span>
      <slot name="title" />
    </div>

    <slot name="preview" />

    <div class="external-media-content">
      <div class="external-media-meta">
        <slot name="author" />
      </div>
    </div>
  </div>
</template>

<style>
@layer defaults {
  :root {
    --external-media-card-bg: var(--color-neutral-2-transparent);
    --external-media-card-color: var(--color-primary);
    --external-media-card-border-radius: var(--border-radius);

    --external-media-card-icon-bg: var(--color-accent-3-transparent);
    --external-media-card-icon-color: var(--external-media-card-color);


    --darkmode-external-media-card-bg: rgba(0,0,0,.8);
    --darkmode-external-media-card-color: var(--color-primary);

    --darkmode-external-media-card-icon-bg: var(--color-accent-3-transparent);
    --darkmode-external-media-card-icon-color: var(--darkmode-external-media-card-color);
  }
}

.external-media-card {
  display: flex;
  flex-direction: column;
  gap: var(--size-xl);
  padding: var(--size-xl);
  border-radius: var(--external-media-card-border-radius);
  background: var(--external-media-card-bg);
  color: var(--external-media-card-color);
  overflow: hidden;
}

body.dark .external-media-card {
  background: var(--darkmode-external-media-card-bg);
  color: var(--darkmode-external-media-card-color);
}

.external-media-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.external-media-meta {
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
  color: var(--external-media-card-color);
  font-size: var(--font-size-sm);
}

.external-media-heading {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.external-media-type {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 999px;
  background: var(--external-media-card-icon-bg);
  color: var(--external-media-card-icon-color);
}

body.dark .external-media-type {
  background: var(--darkmode-external-media-card-icon-bg);
  color: var(--darkmode-external-media-card-icon-color);
}
</style>
