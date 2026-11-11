<script setup lang="ts">
import type { ImageWithTextAndLicence } from "localcosmos-client";
import ImageWithLicence from "../images/ImageWithLicence.vue";

const props = defineProps<{
  image: ImageWithTextAndLicence | null;
  showCaption?: boolean;
  horizontalOnMobile?: boolean;
  isTemplateContentImage?: boolean;
}>();
</script>

<template>
  <div
    class="image-card padding-medium"
    :class="{ 'image-card--horizontal': horizontalOnMobile }"
  >
    <ImageWithLicence v-if="image" :image="image" :show-caption="showCaption" :is-template-content-image="isTemplateContentImage" />
    <slot v-else name="no-image"></slot>
    <div class="image-card__content">
      <slot></slot>
    </div>
  </div>
</template>

<style>
@layer defaults {
  :root {
    --image-card-bg: var(--color-white-translucent);
    --image-card-text-color: #000;

    --darkmode-image-card-bg: #000;
    --darkmode-image-card-text-color: #FFF;

    --image-card-box-shadow: var(--box-shadow);
  }
}

.image-card {
  border-radius: var(--border-radius-sm);
  box-shadow: var(--image-card-box-shadow);
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0;
  background: var(--image-card-bg);
  color: var(--image-card-text-color);
}

body.dark .image-card {
  background: var(--darkmode-image-card-bg);
  color: var(--darkmode-image-card-text-color);
}

.image-card--horizontal {
  display: grid;
  grid-template-columns: 1fr 3fr;
}

.image-card__content {
  padding: var(--size-md) 0 0 0;
}

@media (min-width: 640px) {
 .image-card--horizontal {
    display: flex;
    flex-direction: column;
 }
}

/* Tablet and up: image left, text right */
@media (min-width: 768px) {
}

@media (min-width: 1024px) {
}

@media (min-width: 1280px) {
}

@media (min-width: 1536px) {
}
</style>
