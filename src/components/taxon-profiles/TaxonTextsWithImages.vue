<script setup lang="ts">
import type { TaxonText } from "localcosmos-client";
import { computed } from "vue";
import ImageCarousel from "@/components/images/ImageCarousel.vue";

import ShortLongText from "@/components/ui/ShortLongText.vue";

const props = defineProps<{
  texts: TaxonText[];
  smallImages?: boolean;
  expandedByDefault?: boolean;
}>();

const boxTextTypes = ["Namenskunde", "Hättest Du gedacht, dass..."];

const filteredTexts = computed(() =>
  props.texts.filter((text) => !boxTextTypes.includes(text.taxonTextType)),
);
</script>

<template>
  <template v-for="(text, counter) in filteredTexts" :key="counter">
    <div class="taxon-texts-with-images">
      <div class="taxon-texts-with-images__container">
        <div class="taxon-texts__text-type">
          {{ $t(text.taxonTextType) }}
        </div>
        <div class="taxon-texts-with-images__text">
          <ShortLongText :text="text" :expanded-by-default="props.expandedByDefault" />
        </div>
      </div>
      <div v-if="text.images" class="w-100">
        <ImageCarousel
          :images="text.images"
          :small-images="smallImages"
          :modal-id="`MODAL_IMAGES_${text.taxonTextType}`"
        />
      </div>
    </div>
  </template>
</template>

<style>
.taxon-texts-with-images__container {
  display: block;
  margin-bottom: var(--size-xl);
}

.taxon-texts__text-type {
  font-weight: bold;
}

.taxon-texts-with-images__text {
  text-align: justify;
  line-height: 1.5;
}

@media (min-width: 640px) {
}

@media (min-width: 768px) {
}

@media (min-width: 1024px) {
}

@media (min-width: 1280px) {
  .taxon-texts-with-images__container {
    display: grid;
    grid-template-columns: 1fr 3fr;
    gap: var(--size-xl);
  }
}

@media (min-width: 1536px) {
}
</style>
