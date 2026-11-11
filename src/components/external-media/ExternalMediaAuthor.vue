<script setup lang="ts">
import type { ExternalMedia } from "localcosmos-client";
import { PhArrowSquareOut } from "@phosphor-icons/vue";

const props = defineProps<{
  item: ExternalMedia;
  applyLink?: boolean;
}>();
</script>

<template>
  <a
    v-if="props.applyLink && props.item.url && props.item.author"
    :href="props.item.url"
    target="_blank"
    rel="noopener noreferrer"
    class="external-media-author-link"
  >
    <span class="external-media-author-text">{{ props.item.author }}</span>
    <PhArrowSquareOut class="external-media-author-icon" :size="16" />
  </a>
  <span v-else-if="props.item.author" class="external-media-author">
    {{ props.item.author }}
  </span>
</template>

<style>
@layer defaults {
  :root {
    --external-media-author-color: var(--external-media-card-color);
  }
}

.external-media-author,
.external-media-author-link {
  color: var(--external-media-author-color);
  font-size: var(--font-size-sm);
  text-decoration: none;
}

.external-media-author-link {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}

.external-media-author-text {
  line-height: 1.2;
}

.external-media-author-icon {
  flex-shrink: 0;
  line-height: 1;
}

.external-media-author-link:hover,
.external-media-author-link:focus-visible {
  text-decoration: underline;
}
</style>
