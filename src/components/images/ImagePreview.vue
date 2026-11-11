<script setup lang="ts">
import { ref, computed, nextTick, getCurrentInstance } from "vue";
import type { ImageWithTextAndLicence } from "localcosmos-client";
import ImageWithLicence from "./ImageWithLicence.vue";
import ZoomableImageWithLicence from "./ZoomableImageWithLicence.vue";
import { VueFinalModal } from "vue-final-modal";
import { PhX } from "@phosphor-icons/vue";
import { useModalsStore } from "@/stores/modals";

const props = withDefaults(
  defineProps<{
    image: ImageWithTextAndLicence;
    showCaption?: boolean;
    modalId?: string;
  }>(),
  {
    showCaption: true,
  },
);

const modals = useModalsStore();

const instanceUid = getCurrentInstance()?.uid ?? Math.random();
const modalId = computed(
  () => props.modalId || `image-preview-modal-${instanceUid}`,
);

const zoomableImageRef = ref<any>(null);
const isAnyImageZoomed = ref<boolean>(false);
const modalImageReady = ref<boolean>(false);

const isFullscreenOpen = computed({
  get: () => modals.isOpen(modalId.value),
  set: (val: boolean) => {
    if (val) {
      modals.openModal(modalId.value);
    } else {
      modals.closeModal();
    }
  },
});

const openModal = () => {
  modalImageReady.value = false;
  modals.openModal(modalId.value);
};

const closeModal = () => {
  isAnyImageZoomed.value = false;
  modalImageReady.value = false;
  modals.closeModal();
};

const handleZoomed = (isZoomed: boolean) => {
  isAnyImageZoomed.value = isZoomed;
};

const onModalOpened = async () => {
  await nextTick();
  modalImageReady.value = true;
};

const onModalClosed = () => {
  isAnyImageZoomed.value = false;
  if (
    zoomableImageRef.value &&
    typeof zoomableImageRef.value.resetZoom === "function"
  ) {
    zoomableImageRef.value.resetZoom();
  }
};
</script>

<template>
  <div class="image-preview noselect nohighlight">
    <ImageWithLicence
      :image="image"
      :show-caption="showCaption"
      class="image-preview-thumbnail"
      @click="openModal"
    />

    <VueFinalModal
      v-model="isFullscreenOpen"
      overlay-transition="vfm-fade"
      content-transition="vfm-fade"
      class="vfm-centered"
      @opened="onModalOpened"
      @closed="onModalClosed"
    >
      <div class="gallery-fsm-outer">
        <!-- Modal Image -->
        <div
          class="modal-image-container"
          :class="{ 'image-ready': modalImageReady }"
        >
          <ZoomableImageWithLicence
            ref="zoomableImageRef"
            :image="image"
            @zoomed="handleZoomed"
            class="zoomable-image"
          />
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
.image-preview {
  position: relative;
  width: 100%;
}

.image-preview-thumbnail {
  cursor: pointer;
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

.modal-image-container {
  width: 100%;
  height: 100%;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.modal-image-container.image-ready {
  opacity: 1;
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
