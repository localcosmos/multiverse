<script setup lang="ts">
import { ref } from 'vue';
import { t } from 'i18next';
import { useModalsStore, MODAL_TYPES } from '@/stores/modals';
import ColorButton from '@/components/ui/ColorButton.vue';
import ModalOverlay from './ModalOverlay.vue';
import { useIdbDatasets } from '@/composables/datasets/useIdbDatasets';
import { useRemoteDatasets } from '@/composables/datasets/useRemoteDatasets';

const props = defineProps<{
  datasetUuid: string,
  isIdbDataset?: boolean,
}>();

const { deleteDataset } = useIdbDatasets();
const { deleteRemoteDataset } = useRemoteDatasets();

const emit = defineEmits(['deleted']);

const modals = useModalsStore();

const errorMessage = ref<any>(null);

const openModal = () => {
  modals.openModal(MODAL_TYPES.DELETE_OBSERVATION);
};

const deleteObservation = async () => {

  if (props.isIdbDataset) {
    // Handle deletion for IndexedDB dataset
    await deleteDataset(props.datasetUuid);
    modals.closeModal();
    emit('deleted');
    return;
  } else {
    const result = await deleteRemoteDataset(props.datasetUuid);
    if (result.success) {
      modals.closeModal();
      emit('deleted');
    } else {
      errorMessage.value = result.result ? result.result.error : 'Unknown error';
    }
  }

};
</script>

<template>
  <div>
    <ColorButton
      type="danger"
      @click="openModal"
      :text="t('delete')"
    >
    </ColorButton>
    <ModalOverlay
      :modal-type="MODAL_TYPES.DELETE_OBSERVATION"
      @update:modelValue="val => { if (!val) modals.closeModal(); }"
    >
      <div>
        <h1>{{ $t('myObservations.reallyDeleteObservation') }}</h1>
        <p>
          {{ $t('myObservations.deleteWarning') }}
        </p>
        <div
          v-if="errorMessage"
          class="alert alert-error"
        >
          {{ errorMessage }}
        </div>
      </div>
      <template #actions>
        <ColorButton
          type="default"
          @click="modals.closeModal"
          :text="t('cancel')"
        >
        </ColorButton>
        <ColorButton
          type="danger"
          @click="deleteObservation"
          :text="t('delete')"
        >
      </ColorButton>
      </template>
    </ModalOverlay>
  </div>
</template>
