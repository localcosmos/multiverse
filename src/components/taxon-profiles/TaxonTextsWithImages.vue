<script setup lang="ts">
import type { TaxonText } from 'localcosmos-client';
import GlossarizedText from '@/components/text/GlossarizedText.vue';
import ImageCarousel from '@/components/images/ImageCarousel.vue';

const props = defineProps<{
  texts: TaxonText[]
}>();
</script>

<template>
  <div
    v-for="(text, counter) in texts"
    :key="counter"
    >
    <div class="container page-padding-x">
      <div
        :class="counter == 0 ? 'margin-top' : 'mt-xl'"
      >
          <h2>{{ $t(text.taxonTextType) }}</h2>
      </div>
      <div class="taxon-text">
          <GlossarizedText
          v-if="text.shortText" :html-text="text.shortText"
          />
          <GlossarizedText
          v-if="text.longText" :html-text="text.longText"
          />
      </div>
    </div>
    <div v-if="text.images" class="carousel-container">
        <ImageCarousel
        :images="text.images"
        :modal-id="`MODAL_IMAGES_${text.taxonTextType}`"
        />
    </div>
  </div>
</template>

<style scoped>
.taxon-text {
  text-align:justify;
}
</style>