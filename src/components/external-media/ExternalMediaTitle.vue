<script setup lang="ts">
import type { ExternalMedia } from "localcosmos-client";

const props = defineProps<{
  item: ExternalMedia;
}>();
</script>

<template>
  <div class="external-media-title-row">
    <strong class="external-media-title">
      {{ props.item.title || props.item.url }}
    </strong>
  </div>
</template>

<style>
@layer defaults {
  :root {
    --external-media-title-color: var(--external-media-card-color);

    --darkmode-external-media-title-color: #FFF;
  }
}
.external-media-title-row {
  display: flex;
  align-items: center;
  min-height: 2.25rem;
}

.external-media-title {
  font-size: var(--font-size-xl);
  color: var(--external-media-title-color);
  line-height: 1.2;
}
body.dark .external-media-title {
  color: var(--darkmode-external-media-title-color);
}
</style>
