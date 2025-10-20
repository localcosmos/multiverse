<script setup lang="ts">
import { ref } from 'vue';
import type { ImageWithTextAndLicence } from 'localcosmos-client';
import type { DescriptiveTextAndImagesFilterSpaceData } from 'localcosmos-client';
import { PhSwap } from '@phosphor-icons/vue';
import TranslatableGlossarizedText from '@/components/text/TranslatableGlossarizedText.vue';
import ImageWithLicence from '@/components/images/ImageWithLicence.vue';

const props = defineProps<{
  space: DescriptiveTextAndImagesFilterSpaceData;
  unit: string | null,
}>();

let initialImage: ImageWithTextAndLicence | null = null;
let secondaryImage: ImageWithTextAndLicence | null = null;

if (props.space.imageUrl) {
  initialImage = {
    imageUrl: props.space.imageUrl,
  };
}

if (props.space.secondaryImageUrl) {
  secondaryImage = {
    imageUrl: props.space.secondaryImageUrl,
  };
}

const currentImage = ref<ImageWithTextAndLicence | null>(initialImage);

// Toggle between primary and secondary images
const toggleImage = () => {
  if (initialImage && secondaryImage) {
    if (currentImage.value && currentImage.value.imageUrl === initialImage.imageUrl) {
      currentImage.value = secondaryImage;
    } else {
      currentImage.value = initialImage;
    }
  }
};
</script>

<template>
  <div class="dtai-space-container">
    <div class="dtai-image">
      <ImageWithLicence
        v-if="currentImage"
        :image="currentImage"
        rounded="rounded"
      />
      <img
        v-else
        src="@/assets/images/no-image.svg"
      >
      <div
        v-if="space.secondaryImageUrl"
        class="image-swap cursor-pointer"
        @click.stop="toggleImage"
      >
        <div class="image-swap-circle box-shadow">
          <PhSwap color="#BDBDBD" :size="20" />
        </div>
      </div>
    </div>
    <div
      class="dtai-text"
    >
      <TranslatableGlossarizedText
        :text-key="space.encodedSpace"
      />
    </div>
  </div>
</template>

<style scoped>
.dtai-space-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.dtai-image {
  width: 80px;
}

.dtai-space {
  position: relative;
  border-radius: var(--border-radius);
}

.dtai-space .image-container {
  border-radius: var(--border-radius);
}

.image-swap {
  position: absolute;
  bottom: 10px;
  right: 10px;
}

.dtai-text {
  text-align: center;
}

.dtai-text.impossible {
  opacity: 0.3;
}

.image-swap-circle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: white;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>