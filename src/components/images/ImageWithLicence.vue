<script setup lang="ts">
import type { ImageUrls, ImageWithTextAndLicence } from "localcosmos-client";
import { imageUrlsToSrcSet } from "@/composables/imageUrlsToSrcSet";
import { useTemplateContent } from "@/composables/useTemplateContent";
import LicenceCircle from "@/components/legal/LicenceCircle.vue";
import type { TemplateContentSource } from "@/composables/useTemplateContent";

const { templateContentImageUrlsToSrcSet, templateContentImageUrl } =
  useTemplateContent();

const props = withDefaults(
  defineProps<{
    image: ImageWithTextAndLicence;
    sizes?: string;
    title?: string;
    altText?: string;
    showCaption?: boolean;
    singleLineCaption?: boolean;
    isTemplateContentImage?: boolean; // If true, use different styling for template content images
    templateContentSource?: TemplateContentSource | null; // Optional prop to pass the source for template content images
  }>(),
  {
    showCaption: true,
    singleLineCaption: false,
    isTemplateContentImage: false,
  },
);

const srcSetFn = (imageUrl: ImageUrls): string => {
  if (props.isTemplateContentImage && props.templateContentSource) {
    return templateContentImageUrlsToSrcSet(
      imageUrl,
      props.templateContentSource,
    );
  } else {
    return imageUrlsToSrcSet(imageUrl);
  }
};

const imageUrlFn = (imageUrl: string): string => {
  if (props.isTemplateContentImage && props.templateContentSource) {
    return templateContentImageUrl(imageUrl, props.templateContentSource);
  } else {
    return imageUrl;
  }
};

const hasCaption: boolean = !!(props.showCaption && props.image.text);
</script>

<template>
  <div class="image-with-licence">
    <div
      class="image-with-licence__container"
      :class="{ 'image-with-licence__container--has-caption': hasCaption }"
    >
      <div class="image-with-licence__wrap">
        <img
          loading="lazy"
          :src="imageUrlFn(image.imageUrl['2x'])"
          :srcset="srcSetFn(image.imageUrl)"
          :sizes="sizes ? sizes : ''"
          :alt="altText ? altText : image.text ? image.text : ''"
          v-bind:title="title ? title : undefined"
        />
      </div>
      <div class="image-with-licence__licence-circle">
        <LicenceCircle
          :imageUrl="image.imageUrl['1x']"
          :licence="image.licence"
        />
      </div>
    </div>
    <div
      v-if="showCaption && image.text"
      class="image-with-licence__caption"
      :class="{ 'image-with-licence__caption--single-line': singleLineCaption }"
    >
      <div
        class="image-with-licence__caption-content"
        v-html="image.text"
      ></div>
      <div
        class="image-with-licence__caption-fade"
        v-if="singleLineCaption"
      ></div>
    </div>
  </div>
</template>

<style>
@layer defaults {
  :root {
    --image-with-licence-border-radius: var(--border-radius-sm);
    --image-with-licence__caption-background: rgb(1, 36, 51);
    --image-with-licence__caption-text-color: rgba(169, 207, 208, 1);
    --image-with-licence__caption-fade-background: linear-gradient(
      to right,
      transparent 0%,
      var(--color-neutral) 100%
    );
    --image-with-licence__caption-fade-background-after-bg: radial-gradient(
      circle at center,
      rgba(0, 0, 0, 0) 40%,
      rgba(0, 0, 0, 0.4) 75%,
      rgba(0, 0, 0, 0.7) 100%
    );

    --darkmode-image-with-licence__caption-background: rgba(1, 36, 51, 0.8);
    --darkmode-image-with-licence__caption-text-color: rgba(169, 207, 208, 1);
    --darkmode-image-with-licence__caption-fade-background: linear-gradient(
      to right,
      transparent 0%,
      var(--color-neutral) 100%
    );
    --darkmode-image-with-licence__caption-fade-background-after-bg: radial-gradient(
      circle at center,
      rgba(0, 0, 0, 0) 40%,
      rgba(0, 0, 0, 0.4) 75%,
      rgba(0, 0, 0, 0.7) 100%
    );
  }
}
.image-with-licence {
  width: 100%;
}

.image-with-licence__container {
  width: 100%;
  position: relative; /* Ensure the LicenceCircle is positioned relative to this container */
  overflow: hidden; /* Prevent any overflow from affecting layout */
}

.image-with-licence__container img {
  width: 100%;
  height: auto;
  display: block; /* Fix extra whitespace below the image */
  border-radius: var(--image-with-licence-border-radius);
}

.image-with-licence__container--has-caption img {
  border-radius: var(--image-with-licence-border-radius) var(--image-with-licence-border-radius);
}

.image-with-licence__licence-circle {
  position: absolute;
  right: -9px;
  bottom: -9px;
}

.image-with-licence__caption {
  position: relative;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  margin: 0;
  padding: var(--size-xs) 0 var(--size-xs) var(--size-md);
  background: var(--image-with-licence__caption-background);
  color: var(--image-with-licence__caption-text-color);
  border-radius: 0; /* Match image rounding */
}

body.dark .image-with-licence__caption {
  background: var(--darkmode-image-with-licence__caption-background);
  color: var(--darkmode-image-with-licence__caption-text-color);
}

.image-with-licence__caption {
  border-radius: var(--image-with-licence-border-radius) var(--image-with-licence-border-radius);
}

.image-with-licence__caption--single-line {
  white-space: nowrap; /* Prevent text from wrapping */
  text-overflow: ellipsis; /* Show ellipsis for overflowed text */
  overflow: hidden; /* Hide overflowed content */
}

.image-with-licence__caption-content {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
  font-family: var(--font-family-tight);
  font-weight: 400;
  font-size: var(--font-size-md);
}

.image-with-licence__caption--single-line .image-with-licence__caption-content {
  white-space: nowrap; /* Prevent text from wrapping */
  overflow: hidden; /* Hide overflowed content */
  text-overflow: ellipsis; /* Show ellipsis for overflowed text */
}

.image-with-licence__caption-content p {
  margin: 0;
}

.image-with-licence__caption-fade {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 30px; /* Width of fade effect */
  background: var(--image-with-licence__caption-fade-background);
  pointer-events: none; /* Allow clicks to pass through */
  border-radius: var(--image-with-licence-border-radius);
}

body.dark .image-with-licence__caption-fade {
  background: var(--darkmode-image-with-licence__caption-fade-background);
}

.image-with-licence__wrap {
  position: relative;
}

.image-with-licence__wrap::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: var(--image-with-licence-border-radius);
  pointer-events: none;
  background: var(--image-with-licence__caption-fade-background-after-bg);
}
body.dark .image-with-licence__wrap::after {
  background: var(--darkmode-image-with-licence__caption-fade-background-after-bg);
}
</style>
