<script setup lang="ts">
import { ref, computed, onBeforeUnmount, onMounted } from 'vue';
import { t } from 'i18next';
import type { DatasetReadOnlyImage } from 'localcosmos-client';
import { useModalsStore, MODAL_TYPES } from '@/stores/modals';
import type { DatasetImage } from '@/database/db';
import { useIdbDatasets } from '@/composables/datasets/useIdbDatasets';

import ModalOverlay from '@/components/modals/ModalOverlay.vue';
import ColorButton from '@/components/ui/ColorButton.vue';

import { PhTrash } from '@phosphor-icons/vue';
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue';

const props = defineProps<{
  url?: string,
  image?: DatasetReadOnlyImage,
  localImage?: DatasetImage,
}>();

const emit = defineEmits(['remove']);

const modals = useModalsStore();
const { getImageBlob } = useIdbDatasets();

const imageUrl = ref<string>('');
const isLoading = ref<boolean>(false);
const loadError = ref<boolean>(false);

const modalId = ref(`DELETE_PICTURE_${Math.random().toString(36).substring(2, 9)}`);

// Determine image type and load accordingly
const loadImage = async () => {
  if (props.url) {
    // Server image - use provided URL directly
    imageUrl.value = props.url;
  } else if (props.localImage) {
    // Local image - convert blob to object URL
    isLoading.value = true;
    try {
      const blob = await getImageBlob(props.localImage);
      if (blob) {
        imageUrl.value = URL.createObjectURL(blob);
      } else {
        loadError.value = true;
      }
    } catch (error) {
      console.error('Failed to load local image:', error);
      loadError.value = true;
    } finally {
      isLoading.value = false;
    }
  }
};

const backgroundString = computed(() => {
  if (loadError.value) {
    return 'background-color: var(--color-grey-light)';
  }
  if (imageUrl.value) {
    return `background-image: url(${imageUrl.value})`;
  }
  return 'background-color: var(--color-grey-light)';
});

const openDeleteModal = () => {
  modals.openModal(modalId.value);
};

const onDeleteConfirm = () => {
  modals.closeModal();
  emit('remove');
};

const cleanup = () => {
  if (imageUrl.value && imageUrl.value.startsWith('blob:')) {
    URL.revokeObjectURL(imageUrl.value);
  }
};

onMounted(loadImage);
onBeforeUnmount(cleanup);
</script>


<template>
  <div>
    <div class="image-preview-container">
      <div
        class="image-preview"
        :style="backgroundString"
        :class="{
          'loading': isLoading,
          'error': loadError
        }"
      >
        <LoadingSpinner v-if="isLoading" />
        <div v-else-if="loadError" class="error-overlay">
          Failed to load
        </div>
      </div>
      <div
        class="remove-picture-button cursor-pointer"
        @click="openDeleteModal"
      >
        <PhTrash size="28" />
      </div>
    </div>
    <ModalOverlay
      :modal-type="modalId"
      @update:modelValue="val => { if (!val) modals.closeModal(); }"
    >
      <template #title>
        {{ t('observationForm.removePicture') }}
      </template>
      <div>
        <p>{{ t('observationForm.reallyRemovePicture') }}</p>
      </div>
      <template #actions>
        <ColorButton
          type="danger"
          @click="onDeleteConfirm"
          :text="t('remove')"
        />
        <ColorButton
          @click="modals.closeModal"
          :text="t('cancel')"
        />
      </template>
    </ModalOverlay>
  </div>
</template>

<style scoped>

.image-preview-container {
  width: 100%;
}
.image-preview {
  width:100%;
  aspect-ratio: 1/1;
  background-size: cover;
  border-radius: var(--border-radius);
  border: 2px solid var(--color-grey);
}

.remove-picture-button {
  text-align: center;
}
</style>
