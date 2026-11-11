<script setup lang="ts">
import type { ImageWithTextAndLicence } from 'localcosmos-client';
 import ImageWithLicence from '@/components/images/ImageWithLicence.vue';

import TaxonName from '@/components/ui/TaxonName.vue';

const props = defineProps<{
  isTerminalNode: boolean,
  taxonLatname: string,
  taxonAuthor: string,
  vernacularName?: string | null,
  images?: ImageWithTextAndLicence[],
}>();

let displayedImages: ImageWithTextAndLicence[] = [];

if (props.images && props.images.length) {
  displayedImages = props.images.slice(0, 3);
  //displayedImages = props.images;
}

const fontFamily = props.isTerminalNode === true ? 'var(--font-public-sans-1001)' : 'var(--font-quincy-1001)';
const fontSize = props.isTerminalNode === true ? '16px' : '20px';
</script>

<template>
  <div class="tp-navigation-node">
    <div class="tp-node-name">
      <TaxonName
        :taxon-latname="taxonLatname"
        :vernacular-name="vernacularName"
        :single-line="true"
        :font-family="fontFamily"
        :font-size="fontSize"
      >
      </TaxonName>
    </div>
    <div
      v-if="images && images.length"
      class="tp-node-images margin-top"
      :class="isTerminalNode == true ? 'terminal' : ''"
    >
      <div
        v-for="(image, counter) in displayedImages"
        :key="counter"
        class="tp-node-image"
      >
        <ImageWithLicence
          :image="image"
          :show-caption="false"
          sizes="(max-width: 349px) 100vw, (max-width: 767px) 33vw, (max-width: 1023px) 17vw, 15vw"
        />
      </div>
    </div>
  </div>
</template>

<style>
@layer defaults {
  :root {
    --tp-navigation-node-bg: rgba(255, 255, 255, 0.5);
    --tp-navigation-node-border-radius: var(--border-radius-sm);
    --tp-navigation-node-box-shadow: var(--box-shadow);

    --darkmode-tp-navigation-node-bg: rgba(0, 0, 0, 0.5);
  }
}

.tp-navigation-node {
  padding: var(--size-md);
  border-radius: var(--tp-navigation-node-border-radius);
  box-shadow: var(--tp-navigation-node-box-shadow);
  height: 100%;
  background: var(--tp-navigation-node-bg);
}

body.dark .tp-navigation-node {
  background: var(--darkmode-tp-navigation-node-bg);
}

.tp-node-name {
  font-size: var(--font-size-lg);
}

.tp-node-image {
  width: 100%;
}

@media (min-width: 350px) {
}

@media (min-width: 640px) {
}

@media (min-width: 768px) {
  .tp-node-name {
    font-size: var(--font-size-lg);
  }
}

@media (min-width: 1024px) {

}

@media (min-width: 1280px) {
  .tp-node-name {
    font-size: var(--font-size-xl);
  }
}

@media (min-width: 1536px) {

}
</style>
