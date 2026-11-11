<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import type { ImageWithTextAndLicence } from "localcosmos-client";
import ImageWithLicence from "./ImageWithLicence.vue";
import { PhCaretLeft, PhCaretRight } from "@phosphor-icons/vue";
import { MODAL_TYPES } from "@/stores/modals";
import ImagesModal from "./ImagesModal.vue";

const props = withDefaults(
  defineProps<{
    images: ImageWithTextAndLicence[];
    showCaptionInCarousel?: boolean;
    equalImageHeights?: boolean;
    equalImageHeight?: string;
    equalImageAspectRatio?: string;
    smallImages?: boolean;
    safeCenter?: boolean;
    zoomable?: boolean;
    modalId?: string;
  }>(),
  {
    showCaptionInCarousel: true,
    equalImageHeights: false,
  },
);

const equalImageStyles = computed(() => {
  const styles: Record<string, string> = {};

  if (props.equalImageHeight) {
    styles["--carousel-equal-image-height"] = props.equalImageHeight;
  }

  if (props.equalImageAspectRatio) {
    styles["--carousel-equal-image-aspect-ratio"] = props.equalImageAspectRatio;
  }

  return styles;
});

const modalId = props.modalId || MODAL_TYPES.FULLSCREEN;
const imagesModal = ref<InstanceType<typeof ImagesModal> | null>(null);

const imagesContainer = ref<HTMLElement | null>(null);
const showLeftButton = ref<boolean>(false);
const showRightButton = ref<boolean>(false);

const openModal = (index: number) => {
  imagesModal.value?.open(index);
};

const scrollToNext = () => {
  if (imagesContainer.value) {
    const container = imagesContainer.value;
    container.scrollBy({ left: container.offsetWidth, behavior: "smooth" });
  }
};

const scrollToPrevious = () => {
  if (imagesContainer.value) {
    const container = imagesContainer.value;
    container.scrollBy({ left: -container.offsetWidth, behavior: "smooth" });
  }
};

const updateButtonVisibility = () => {
  if (imagesContainer.value) {
    const container = imagesContainer.value;
    const tolerance = 30;
    showLeftButton.value = container.scrollLeft > tolerance;
    showRightButton.value =
      container.scrollLeft + container.clientWidth <
      container.scrollWidth - tolerance;
  }
};

onMounted(() => {
  if (imagesContainer.value) {
    updateButtonVisibility();
    imagesContainer.value.addEventListener("scroll", updateButtonVisibility);
  }
});

onUnmounted(() => {
  if (imagesContainer.value) {
    imagesContainer.value.removeEventListener("scroll", updateButtonVisibility);
  }
});
</script>

<template>
  <div
    class="carousel noselect nohighlight"
    :class="{ 'small-images': smallImages }"
  >
    <!-- Left Navigation Button -->
    <div class="carousel-left" v-if="showLeftButton" @click="scrollToPrevious">
      <div class="bg-translucent">
        <PhCaretLeft :size="24" />
      </div>
    </div>

    <!-- Images Container -->
    <div
      ref="imagesContainer"
      class="carousel-images-container"
      :class="{
        'safe-center': safeCenter,
        'equal-image-heights': equalImageHeights,
      }"
      :style="equalImageStyles"
    >
      <!-- Images -->
      <div
        v-for="(image, counter) in images"
        :key="counter"
        class="carousel-image-container"
      >
        <ImageWithLicence
          :image="image"
          :show-caption="showCaptionInCarousel"
          @click="() => openModal(counter)"
        />
      </div>
    </div>

    <!-- Right Navigation Button -->
    <div class="carousel-right" v-if="showRightButton" @click="scrollToNext">
      <div class="bg-translucent">
        <PhCaretRight :size="24" />
      </div>
    </div>

    <ImagesModal ref="imagesModal" :images="images" :modal-id="modalId" />
  </div>
</template>

<style scoped>
.carousel {
  width: 100%;
  position: relative;
  overflow: hidden;
  /*touch-action: pan-y;*/ /* fixes problems in the combination of horizontal slider - vertical page scrolling */ /* interferes with scroll snap */
}

.carousel-left,
.carousel-right {
  position: absolute;
  width: 50px;
  aspect-ratio: 1/1;
  display: none;
  justify-content: center;
  align-items: center;
  top: calc(50% - 18px);
  opacity: 1;
  transition: var(--transition-cubic);
  cursor: pointer;
  z-index: var(--layer-2);
}

.carousel-left > div,
.carousel-right > div {
  width: 35px;
  aspect-ratio: 1/1;
  display: flex;
  border-radius: 50%;
  justify-content: center;
  align-items: center;
}

.carousel-left.off,
.carousel-right.off {
  opacity: 0;
  transform: scale3d(0, 0, 0);
}

.carousel-left {
  left: calc(var(--size-xl) / 2);
}

.carousel-right {
  right: calc(var(--size-xl) / 2);
}

.carousel-images-container {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  overflow-x: auto; /* Enable horizontal scrolling */
  scroll-snap-type: x mandatory; /* Enable snapping on the x-axis */
  scroll-padding-left: var(
    --size-xl
  ); /* Ensure snapping respects left padding */
  gap: 6px;
  padding: 0;
  -webkit-overflow-scrolling: touch; /* Smooth scrolling for iOS */
  scrollbar-width: none; /* Firefox */
}

.carousel-images-container.safe-center {
  justify-content: safe center;
}

.carousel-images-container::-webkit-scrollbar {
  display: none; /* Chrome, Safari */
}

.carousel-images-container.equal-image-heights .carousel-image-container {
  display: flex;
  align-items: stretch;
  height: var(--carousel-equal-image-height, auto);
  aspect-ratio: var(--carousel-equal-image-aspect-ratio, 16 / 10);
}

.carousel-images-container.equal-image-heights
  .carousel-image-container
  :deep(.image-with-licence) {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.carousel-images-container.equal-image-heights
  .carousel-image-container
  :deep(.image-container) {
  flex: 1;
}

.carousel-images-container.equal-image-heights
  .carousel-image-container
  :deep(.image-container img) {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.carousel-image-container {
  flex-shrink: 0;
  scroll-snap-align: start; /* Snap each image to the start of the container */
  width: 90%; /* Make sure the second image is visible slightly */
  aspect-ratio: 1/1;
}

.carousel-image-container img {
  width: 100%;
  height: auto;
  border-radius: var(--border-radius-sm);
}

.carousel.small-images .carousel-image-container {
  width: 200px;
}

.carousel-image-container:first-child {
  margin-left: var(--size-xl);
}

.carousel-image-container:last-child {
  margin-right: var(--size-xl);
}

@media (min-width: 400px) {
  .carousel-image-container {
    width: 360px;
  }
}

@media (min-width: 640px) {
}

@media (min-width: 768px) {
  .carousel-left,
  .carousel-right {
    display: flex;
  }
}

@media (min-width: 1024px) {
}

@media (min-width: 1280px) {
  .carousel-image-container {
    width: calc(
      (1280px - (var(--size-xl) * 2) - (6px * 3)) / 4
    ); /* 4 images fully visible with padding and gaps */
  }

  .carousel-image-container:first-child {
    margin-left: 0;
  }

  .carousel-images-container.safe-center .carousel-image-container:first-child {
    margin-left: var(--size-xl);
  }

  .carousel-images-container.safe-center .carousel-image-container:last-child {
    margin-right: var(--size-xl);
  }

  .carousel-images-container .carousel-image-container:first-child {
    margin-left: var(--size-xl);
  }

  .carousel-images-container .carousel-image-container:last-child {
    margin-right: var(--size-xl);
  }
}

@media (min-width: 1536px) {
}
</style>
