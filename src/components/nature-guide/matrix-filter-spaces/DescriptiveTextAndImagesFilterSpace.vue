<script setup lang="ts">
import { ref } from "vue";
import { PhSwap } from "@phosphor-icons/vue";
import type { ImageWithTextAndLicence } from "localcosmos-client";
import { DescriptiveTextAndImagesFilterSpace } from "localcosmos-client";

import ImageWithLicence from "@/components/images/ImageWithLicence.vue";
import TranslatableGlossarizedText from "@/components/text/TranslatableGlossarizedText.vue";

import { useFilterSpace } from "@/composables/useFilterSpace";

const props = withDefaults(
  defineProps<{
    space: DescriptiveTextAndImagesFilterSpace;
    readOnly: boolean;
  }>(),
  {
    readOnly: false,
  },
);

let initialImage: ImageWithTextAndLicence | null = null;
let secondaryImage: ImageWithTextAndLicence | null = null;

if (props.space.data.imageUrl) {
  initialImage = {
    imageUrl: props.space.data.imageUrl,
  };
}

if (props.space.data.secondaryImageUrl) {
  secondaryImage = {
    imageUrl: props.space.data.secondaryImageUrl,
  };
}

const currentImage = ref<ImageWithTextAndLicence | null>(initialImage);

// Toggle between primary and secondary images
const toggleImage = () => {
  if (initialImage && secondaryImage) {
    if (
      currentImage.value &&
      currentImage.value.imageUrl === initialImage.imageUrl
    ) {
      currentImage.value = secondaryImage;
    } else {
      currentImage.value = initialImage;
    }
  }
};

const { toggleSelection } = useFilterSpace(props.space, props.readOnly);
</script>

<template>
  <div>
    <div
      class="matrix-filter-space dtai-space"
      :class="{
        'cursor-pointer': !readOnly,
        selected: space.isSelected,
        impossible: !space.isPossible,
      }"
      @click.stop="toggleSelection"
    >
      <ImageWithLicence v-if="currentImage" :image="currentImage" />
      <img v-else src="@/assets/images/no-image.svg" />
      <div
        v-if="space.data.secondaryImageUrl"
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
      :class="{
        impossible: !space.isPossible,
      }"
    >
      <TranslatableGlossarizedText :text-key="space.data.encodedSpace" />
    </div>
  </div>
</template>

<style>
@layer defaults {
  :root {
    --dtai-space-bg: rgba(255,255,255,1);
    --image-swap-bg: white;
    --dtai-space-border-radius: var(--border-radius);

    --darkmode-dtai-space-bg: rgba(255,255,255,0.1);
    --darkmode-image-swap-bg: rgba(255,255,255,0.1);

    --image-swap-top: 10px;
    --image-swap-right: 10px;
  }
}

.dtai-space {
  position: relative;
  border-radius: var(--dtai-space-border-radius);
  background: var(--dtai-space-bg);
}

body.dark .dtai-space {
  background: var(--darkmode-dtai-space-bg);
}

.dtai-space .image-container {
  border-radius: var(--dtai-space-border-radius);
}

.image-swap {
  position: absolute;
  top: var(--image-swap-top);
  right: var(--image-swap-right);
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
  background-color: var(--image-swap-bg);
  display: flex;
  align-items: center;
  justify-content: center;
}

body.dark .image-swap-circle {
  background-color: var(--darkmode-image-swap-bg);
}

</style>
