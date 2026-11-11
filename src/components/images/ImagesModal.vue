<script setup lang="ts">
import { ref, computed, nextTick, getCurrentInstance } from 'vue';
import type { ImageWithTextAndLicence } from 'localcosmos-client';
import ZoomableImageWithLicence from './ZoomableImageWithLicence.vue';
import { VueFinalModal } from 'vue-final-modal';
import { PhCaretLeft, PhCaretRight, PhX } from '@phosphor-icons/vue';
import { useModalsStore } from '@/stores/modals';

const props = defineProps<{
  images: ImageWithTextAndLicence[];
  modalId?: string;
}>();

const emit = defineEmits<{
  closed: [];
}>();

const modals = useModalsStore();
const instanceUid = getCurrentInstance()?.uid ?? Math.random();
const resolvedModalId = computed(() => props.modalId || `images-modal-${instanceUid}`);

const modalImagesContainer = ref<HTMLElement | null>(null);
const modalImageIndex = ref<number | null>(null);
const zoomableImageRefs = ref<any[]>([]);

const showLeftButton = ref<boolean>(false);
const showRightButton = ref<boolean>(false);
const isAnyImageZoomed = ref<boolean>(false);
const imagesReady = ref<boolean>(false);

const isOpen = computed({
  get: () => modals.isOpen(resolvedModalId.value),
  set: (val: boolean) => {
    if (val) modals.openModal(resolvedModalId.value);
    else modals.closeModal();
  },
});

const open = (index: number) => {
  modalImageIndex.value = index;
  imagesReady.value = false;
  modals.openModal(resolvedModalId.value);
};

const close = () => {
  isAnyImageZoomed.value = false;
  imagesReady.value = false;
  modals.closeModal();
  onClosed();
};

const scrollToImage = async (smooth = false) => {
  if (modalImagesContainer.value && modalImageIndex.value != null) {
    await nextTick();
    const container = modalImagesContainer.value;
    container.scrollTo({
      left: container.clientWidth * modalImageIndex.value,
      behavior: smooth ? 'smooth' : 'instant',
    });
    if (!smooth) {
      await nextTick();
      imagesReady.value = true;
    }
  }
};

const updateButtonVisibility = () => {
  if (modalImagesContainer.value) {
    const c = modalImagesContainer.value;
    const tolerance = 30;
    showLeftButton.value = c.scrollLeft > tolerance;
    showRightButton.value = c.scrollLeft + c.clientWidth < c.scrollWidth - tolerance;
  }
};

const onScrollEnd = () => {
  if (!modalImagesContainer.value) return;
  const newIndex = Math.round(modalImagesContainer.value.scrollLeft / modalImagesContainer.value.clientWidth);
  if (newIndex !== modalImageIndex.value) {
    if (modalImageIndex.value !== null) {
      const z = zoomableImageRefs.value[modalImageIndex.value];
      if (z && typeof z.resetZoom === 'function') z.resetZoom();
    }
    modalImageIndex.value = newIndex;
  }
};

const onOpened = async () => {
  await nextTick();
  if (!modalImagesContainer.value) {
    setTimeout(() => scrollToImage(), 50);
  } else {
    scrollToImage();
  }
  modalImagesContainer.value?.addEventListener('scroll', updateButtonVisibility);
  modalImagesContainer.value?.addEventListener('scrollend', onScrollEnd);
  updateButtonVisibility();
};

const onClosed = () => {
  modalImageIndex.value = null;
  isAnyImageZoomed.value = false;
  zoomableImageRefs.value.forEach((z) => {
    if (z && typeof z.resetZoom === 'function') z.resetZoom();
  });
  emit('closed');
};

const resetCurrentZoom = () => {
  if (modalImageIndex.value !== null) {
    const z = zoomableImageRefs.value[modalImageIndex.value];
    if (z && typeof z.resetZoom === 'function') z.resetZoom();
  }
};

const goNext = () => {
  if (modalImagesContainer.value && modalImageIndex.value !== null) {
    resetCurrentZoom();
    modalImageIndex.value = Math.min(modalImageIndex.value + 1, props.images.length - 1);
    scrollToImage(true);
    updateButtonVisibility();
  }
};

const goPrev = () => {
  if (modalImagesContainer.value && modalImageIndex.value !== null) {
    resetCurrentZoom();
    modalImageIndex.value = Math.max(modalImageIndex.value - 1, 0);
    scrollToImage(true);
    updateButtonVisibility();
  }
};

const handleZoomed = (isZoomed: boolean) => {
  isAnyImageZoomed.value = isZoomed;
};

defineExpose({ open });
</script>

<template>
  <VueFinalModal
    v-model="isOpen"
    overlay-transition="vfm-fade"
    content-transition="vfm-fade"
    class="vfm-centered"
    @opened="onOpened"
    @closed="onClosed"
  >
    <div class="gallery-fsm-outer">
      <!-- Left Navigation -->
      <div
        class="nav-btn nav-btn-left"
        :class="{ off: !showLeftButton || isAnyImageZoomed }"
        @click="goPrev"
      >
        <div class="bg-translucent">
          <PhCaretLeft :size="24" />
        </div>
      </div>

      <!-- Images Container -->
      <div
        ref="modalImagesContainer"
        class="images-container"
        :class="{ 'images-ready': imagesReady }"
        :style="{ touchAction: isAnyImageZoomed ? 'none' : 'pan-x' }"
      >
        <div
          v-for="(image, index) in images"
          :key="index"
          class="image-slot"
        >
          <ZoomableImageWithLicence
            :ref="(el) => { if (el) zoomableImageRefs[index] = el }"
            :image="image"
            @zoomed="handleZoomed"
          />
        </div>
      </div>

      <!-- Right Navigation -->
      <div
        class="nav-btn nav-btn-right"
        :class="{ off: !showRightButton || isAnyImageZoomed }"
        @click="goNext"
      >
        <div class="bg-translucent">
          <PhCaretRight :size="24" />
        </div>
      </div>

      <!-- Close Button -->
      <div class="close-btn" @click="close">
        <PhX :size="32" />
      </div>
    </div>
  </VueFinalModal>
</template>

<style scoped>
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

.images-container {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  gap: 0;
  padding: 0;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  opacity: 0;
  transition: opacity 0.2s ease;
  width: 100%;
  height: 100%;
}

.images-container.images-ready {
  opacity: 1;
}

.images-container::-webkit-scrollbar {
  display: none;
}

.image-slot {
  flex-shrink: 0;
  scroll-snap-align: center;
  width: 100%;
  height: 100%;
}

.nav-btn {
  position: absolute;
  width: 50px;
  aspect-ratio: 1/1;
  display: flex;
  justify-content: center;
  align-items: center;
  top: calc(50% - 25px);
  opacity: 1;
  transition: var(--transition-cubic);
  cursor: pointer;
  z-index: var(--layer-4);
}

.nav-btn > div {
  width: 35px;
  aspect-ratio: 1/1;
  display: flex;
  border-radius: 50%;
  justify-content: center;
  align-items: center;
}

.nav-btn-left {
  left: calc(var(--size-xl) / 2);
}

.nav-btn-right {
  right: calc(var(--size-xl) / 2);
}

.nav-btn.off {
  opacity: 0;
  transform: scale3d(0, 0, 0);
}

.close-btn {
  position: fixed;
  right: 10px;
  top: 10px;
  width: 40px;
  aspect-ratio: 1/1;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  cursor: pointer;
  z-index: var(--layer-4);
}
</style>
