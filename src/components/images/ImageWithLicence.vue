<script setup lang="ts">
import type { ImageWithTextAndLicence } from 'localcosmos-client';
import { imageUrlsToSrcSet } from '@/composables/imageUrlsToSrcSet';
import { templateContentImageUrlsToSrcSet } from '@/composables/templateContentImageUrlsToSrcSet';
import LicenceCircle from '@/components/legal/LicenceCircle.vue';

const props = withDefaults(defineProps<{
  image: ImageWithTextAndLicence,
  sizes?: string,
  rounded?: string,
  title? : string,
  altText?: string,
  showCaption?: boolean,
  isTemplateContentImage?: boolean, // If true, use different styling for template content images
}>(),(
  {
    showCaption: true,
    isTemplateContentImage: false,
  }
));

const srcSetFn = props.isTemplateContentImage ? templateContentImageUrlsToSrcSet : imageUrlsToSrcSet;

const hasCaption: boolean = !!(props.showCaption && props.image.text);

// sharpen the licence circle if there are no rounded
const sharpLicenceCircle = !props.rounded || (hasCaption && (
  props.rounded === 'rounded' ||
  props.rounded === 'rounded-xs' ||
  props.rounded === 'rounded-sm'
));

</script>

<template>
  <div class="image-with-licence">
    <div
      class="image-container"
      :class="{ 'has-caption': hasCaption }"
    >
      <img
        loading="lazy"
        :src="image.imageUrl['2x']"
        :srcset="srcSetFn(image.imageUrl)"
        :sizes="sizes ? sizes : ''"
        :alt="altText ? altText : image.text ? image.text : ''"
        v-bind:class="rounded ? rounded : 'sharp'"
        v-bind:title="title ? title : undefined"
      />
      <LicenceCircle
        :imageUrl="image.imageUrl['1x']"
        class="image-licence-circle"
        :sharp="sharpLicenceCircle"
      />
    </div>
    <div class="caption" v-if="showCaption && image.text">
      <div class="caption-content" v-html="image.text"></div>
      <div class="caption-fade"></div>
    </div>
  </div>
</template>

<style scoped>
.image-with-licence {
  width: 100%;
}

.image-container {
  width: 100%;
  position: relative; /* Ensure the LicenceCircle is positioned relative to this container */
  overflow: hidden; /* Prevent any overflow from affecting layout */
}

.image-container img {
  width: 100%;
  height: auto;
  display: block; /* Fix extra whitespace below the image */
}

.image-container img.rounded {
  border-radius: var(--border-radius-sm);
}

.image-container.has-caption img.rounded {
  border-radius: var(--border-radius-sm) var(--border-radius-sm) 0 0;
}

.image-container img.rounded-xs {
  border-radius: var(--border-radius-xs);
}

.image-container.has-caption img.rounded-xs {
  border-radius: var(--border-radius-xs) var(--border-radius-xs) 0 0;
}

.image-licence-circle {
  position: absolute;
  right: -9px;
  bottom: -9px;
}

.caption {
  position: relative;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  margin: 0;
  padding: 0 0 0 var(--size-md);
  background: var(--color-white-translucent-light);
  color: #000;
  overflow: hidden; /* Hide overflowed content */
  border-radius: 0 0 var(--border-radius-sm) var(--border-radius-sm); /* Match image rounding */
}

.caption-content {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  min-width: 0; /* ✅ Keep ellipsis experiment */
  font-family: 'RobotoCondensed';
  font-weight: 400;
  font-size: var(--font-size-md);
}

.caption-fade {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 30px; /* Width of fade effect */
  background: linear-gradient(to right, transparent 0%, #FFF 100%);
  pointer-events: none; /* Allow clicks to pass through */
}
</style>