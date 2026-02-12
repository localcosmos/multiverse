<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import type { ImageWithTextAndLicence } from 'localcosmos-client';
import ImageWithLicence from './ImageWithLicence.vue';
import ZoomableImageWithLicence from './ZoomableImageWithLicence.vue';
import { VueFinalModal } from 'vue-final-modal';
import { PhCaretLeft, PhCaretRight, PhX } from '@phosphor-icons/vue';

import { useModalsStore, MODAL_TYPES } from '@/stores/modals';

const props = defineProps<{
  images: ImageWithTextAndLicence[],
  smallImages?: boolean,
  safeCenter?: boolean,
  zoomable?: boolean,
  modalId?: string,
}>();

const modals = useModalsStore();

const modalId = props.modalId || MODAL_TYPES.FULLSCREEN;

const imagesContainer = ref<HTMLElement | null>(null);
const modalImagesContainer = ref<HTMLElement | null>(null); // Reference to the modal images container
const modalImageIndex = ref<number | null>(null); // Track the index of the currently displayed image in the modal
const zoomableImageRefs = ref<any[]>([]); // Template refs for ZoomableImageWithLicence components

const showLeftButton = ref<boolean>(false);
const showRightButton = ref<boolean>(false);

const showLeftModalButton = ref<boolean>(false);
const showRightModalButton = ref<boolean>(false);

const isAnyImageZoomed = ref<boolean>(false); // Track if any image is currently zoomed
const modalImagesReady = ref<boolean>(false); // Track if modal images are positioned correctly

const isFullscreenOpen = computed({
  get: () => modals.isOpen(modalId),
  set: (val: boolean) => {
    if (val) {
      modals.openModal(modalId);
    } else {
      modals.closeModal();
    }
  }
});

const openModal = (index: number) => {
  modalImageIndex.value = index; // Set the index of the clicked image
  modalImagesReady.value = false; // Reset ready state when opening modal
  modals.openModal(modalId);
};

const closeModal = () => {
  // Reset zoom state before closing
  isAnyImageZoomed.value = false;
  modalImagesReady.value = false; // Reset ready state when closing modal
  
  modals.closeModal();
  onModalClosed();
};

const scrollToNext = () => {
  if (imagesContainer.value) {
    const container = imagesContainer.value;
    const scrollAmount = container.offsetWidth; // Scroll by the width of the container
    container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  }
};

const scrollToPrevious = () => {
  if (imagesContainer.value) {
    const container = imagesContainer.value;
    const scrollAmount = container.offsetWidth; // Scroll by the width of the container
    container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
  }
};

const scrollToNextModalImage = () => {
  if (modalImagesContainer.value && modalImageIndex.value !== null) {
    // Reset zoom on current image before navigating
    resetCurrentImageZoom();
    
    const nextIndex = Math.min(modalImageIndex.value + 1, props.images.length - 1);
    modalImageIndex.value = nextIndex;
    scrollModalToImage(true); // Use smooth scrolling for button navigation
    updateModalButtonVisibility();
  }
};

const scrollToPreviousModalImage = () => {
  if (modalImagesContainer.value && modalImageIndex.value !== null) {
    // Reset zoom on current image before navigating
    resetCurrentImageZoom();
    
    const prevIndex = Math.max(modalImageIndex.value - 1, 0);
    modalImageIndex.value = prevIndex;
    scrollModalToImage(true); // Use smooth scrolling for button navigation
    updateModalButtonVisibility();
  }
};

// Reset zoom on the currently displayed image
const resetCurrentImageZoom = () => {
  if (modalImageIndex.value !== null && zoomableImageRefs.value[modalImageIndex.value]) {
    const currentZoomableComponent = zoomableImageRefs.value[modalImageIndex.value];
    if (currentZoomableComponent && typeof currentZoomableComponent.resetZoom === 'function') {
      currentZoomableComponent.resetZoom();
    }
  }
};

// Handle zoom state changes from individual images
const handleZoomed = (isZoomed: boolean) => {
  isAnyImageZoomed.value = isZoomed;
};

// Scroll the modal to the correct image
const scrollModalToImage = async (smooth = false) => {
  if (modalImagesContainer.value && modalImageIndex.value != null) {
    await nextTick(); // Ensure the DOM is fully updated
    const container = modalImagesContainer.value;
    
    const scrollAmount = container.clientWidth * modalImageIndex.value;
    container.scrollTo({ 
      left: scrollAmount, 
      behavior: smooth ? 'smooth' : 'instant' 
    });
    
    // Mark images as ready after positioning
    if (!smooth) {
      await nextTick();
      modalImagesReady.value = true;
    }
  }
};

const onModalOpened = async () => {
  // Wait for the modalImagesContainer to be fully initialized
  await nextTick();
  if (!modalImagesContainer.value) {
    // Retry after a short delay if the container is not yet available
    setTimeout(() => {
      scrollModalToImage();
    }, 50);
  } else {
    scrollModalToImage(); // Ensure scrolling happens after the modal is fully opened
  }

  if (modalImagesContainer.value) {
    modalImagesContainer.value.addEventListener('scroll', updateModalButtonVisibility);
  }
  updateModalButtonVisibility();
};

const onModalClosed = () => {
  modalImageIndex.value = null; // Reset the modal image index
  isAnyImageZoomed.value = false; // Reset zoom state tracking

  // Reset zoom on all ZoomableImageWithLicence components
  zoomableImageRefs.value.forEach((zoomableComponent) => {
    if (zoomableComponent && typeof zoomableComponent.resetZoom === 'function') {
      zoomableComponent.resetZoom();
    }
  });
};

const updateButtonVisibility = () => {
  if (imagesContainer.value) {
    const container = imagesContainer.value;
    const tolerance = 30; // Small tolerance to account for floating-point inaccuracies

    // Check if the container is scrolled past the start
    showLeftButton.value = container.scrollLeft > tolerance;

    // Check if the container is not fully scrolled to the end
    showRightButton.value =
      container.scrollLeft + container.clientWidth < container.scrollWidth - tolerance;
  }
};

const updateModalButtonVisibility = () => {
  if (modalImagesContainer.value) {
    const container = modalImagesContainer.value;
    const tolerance = 30; // Small tolerance to account for floating-point inaccuracies

    // Check if the container is scrolled past the start
    showLeftModalButton.value = container.scrollLeft > tolerance;

    // Check if the container is not fully scrolled to the end
    showRightModalButton.value =
      container.scrollLeft + container.clientWidth < container.scrollWidth - tolerance;
  }
};

onMounted(() => {
  if (imagesContainer.value) {
    updateButtonVisibility();
    imagesContainer.value.addEventListener('scroll', updateButtonVisibility);
  }
});

onUnmounted(() => {
  if (imagesContainer.value) {
    imagesContainer.value.removeEventListener('scroll', updateButtonVisibility);
  }
});
</script>

<template>
  <div
    class="carousel noselect nohighlight"
    :class="{ 'small-images': smallImages }"
  >
    <!-- Left Navigation Button -->
    <div
      class="carousel-left"
      v-if="showLeftButton"
      @click="scrollToPrevious"
    >
      <div class="bg-translucent">
        <PhCaretLeft :size="24" />
      </div>
    </div>

    <!-- Images Container -->
    <div
      ref="imagesContainer"
      class="carousel-images-container"
      :class="{ 'safe-center': safeCenter }"
    >
      <!-- Images -->
      <div
        v-for="(image, counter) in images"
        :key="counter"
        class="carousel-image-container"
      >
        <ImageWithLicence
          :image="image"
          rounded="rounded-xs"
          :show-caption="true"
          @click="() => openModal(counter)"
        />
      </div>
    </div>

    <!-- Right Navigation Button -->
    <div
      class="carousel-right"
      v-if="showRightButton"
      @click="scrollToNext"
    >
      <div class="bg-translucent">
        <PhCaretRight :size="24" />
      </div>
    </div>

    <!-- Fullscreen Modal -->
    <VueFinalModal
      v-model="isFullscreenOpen"
      overlay-transition="vfm-fade"
      content-transition="vfm-fade"
      class="vfm-centered"
      @opened="onModalOpened"
      @closed="onModalClosed"
    >
      <div class="gallery-fsm-outer">
        <!-- Left Navigation in Modal -->
        <div
          class="modal-carousel-left"
          :class="{ off: !showLeftModalButton || isAnyImageZoomed }"
          @click="scrollToPreviousModalImage"
        >
          <div class="bg-translucent">
            <PhCaretLeft :size="24" />
          </div>
        </div>

        <!-- Modal Images Container -->
        <div
          class="modal-images-container"
          ref="modalImagesContainer"
          :class="{ 'images-ready': modalImagesReady }"
        >
          <div
            v-for="(image, index) in images"
            :key="index"
            class="modal-image-container"
          >
            <ZoomableImageWithLicence
              :ref="(el) => { if (el) zoomableImageRefs[index] = el }"
              :image="image"
              @zoomed="handleZoomed"
              class="zoomable-image"
            />
          </div>
        </div>

        <!-- Right Navigation in Modal -->
        <div
          class="modal-carousel-right"
          :class="{ off: !showRightModalButton || isAnyImageZoomed }"
          @click="scrollToNextModalImage"
        >
          <div class="bg-translucent">
            <PhCaretRight :size="24" />
          </div>
        </div>

        <!-- Close Button -->
        <div class="close-btn" @click="closeModal">
          <PhX :size="32" />
        </div>
      </div>
    </VueFinalModal>
  </div>
</template>

<style scoped>
.carousel {
  width: 100%;
  position: relative;
  overflow: hidden;
  touch-action: pan-y; /* fixes problems in the combination of horizontal slider - vertical page scrolling */
}

.carousel-left, .modal-carousel-left , .carousel-right, .modal-carousel-right {
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
}

.carousel-left > div, .carousel-right > div, .modal-carousel-left > div, .modal-carousel-right > div {
  width: 35px;
  aspect-ratio: 1/1;
  display: flex;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.carousel-left, .carousel-right {
  z-index: var(--layer-2);
}

.modal-carousel-left, .modal-carousel-right {
  z-index: var(--layer-4);
}

.carousel-left.off, .carousel-right.off, .modal-carousel-left.off, .modal-carousel-right.off {
  opacity: 0;
  transform: scale3d(0,0,0);
}

.carousel-left, .modal-carousel-left {
  left: calc(var(--size-md) / 2);
}

.carousel-right, .modal-carousel-right {
  right: calc(var(--size-md) / 2);
}

.carousel-images-container {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  overflow-x: auto; /* Enable horizontal scrolling */
  scroll-snap-type: x mandatory; /* Enable snapping on the x-axis */
  scroll-padding-left: var(--size-md); /* Ensure snapping respects left padding */
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
  width: 120px;
}

.carousel-image-container:first-child {
  margin-left: var(--size-md);
}

.carousel-image-container:last-child {
  margin-right: var(--size-md);
}

.modal-images-container {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  overflow-x: auto; /* Enable horizontal scrolling */
  scroll-snap-type: x mandatory; /* Enable snapping on the x-axis */
  gap: 10px;
  padding: 0;
  -webkit-overflow-scrolling: touch; /* Smooth scrolling for iOS */
  scrollbar-width: none; /* Firefox */
  touch-action: pan-y; /* Only allow vertical touch gestures, disable horizontal swiping */
  opacity: 0; /* Start hidden to prevent flash */
  transition: opacity 0.2s ease;
  width: 100%;
  height: 100%;
}

.modal-images-container.images-ready {
  opacity: 1; /* Show when positioned correctly */
}

.modal-images-container::-webkit-scrollbar {
  display: none; /* Chrome, Safari */
}

.modal-image-container {
  flex-shrink: 0;
  scroll-snap-align: center; /* Snap each image to the center of the container */
  width: 100%; /* Full width for modal images */
  aspect-ratio: 1/1;
}

.gallery-fsm-outer {
  width: 100vw;
  width: 100dvw;
  height: 100vh;
  height: 100dvh;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

.close-btn {
  position: fixed;
  right: 10px;
  top : 10px;
  width: 40px;
  aspect-ratio: 1/1;
  background: rgba(255,255,255, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  cursor: pointer;
}

@media (min-width: 400px) {
  .carousel-image-container {
    width: 360px;
  }
}

@media (min-width: 640px) {
}

@media (min-width: 768px) {
  .carousel-left , .carousel-right {
    display: flex;
  }
}

/* Always show modal navigation buttons on all screen sizes */
.modal-carousel-left, .modal-carousel-right {
  display: flex !important;
}

@media (min-width: 1024px) {

}

@media (min-width: 1280px) {
  .carousel-image-container { 
    width: calc( (1280px - ( var(--size-md) * 2) - (6px * 3) ) / 4 ); /* 4 images fully visible with padding and gaps */
  }

  .carousel-images-container {
    /*scroll-padding: 0;*/ /* Ensure snapping respects left padding */
    padding: 0;
  }

  .carousel-image-container:first-child {
    /*margin-left: 0; */
  }

  .carousel-images-container.safe-center:first-child {
    margin-left: var(--size-md);
  }

  .carousel-image-container:last-child {
    /*margin-right: 0; */
  }

  .carousel-images-container.safe-center:last-child {
    margin-right: var(--size-md);
  }
}

@media (min-width: 1536px) {
}
</style>