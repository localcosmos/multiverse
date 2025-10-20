<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import type { TaxonType, ReadOnlyDataset, GenericForm as GenericFormType } from 'localcosmos-client';
import { LCApiResultTypes } from 'localcosmos-client';
import ContentContainer from '@/components/container/ContentContainer.vue';
import { t } from 'i18next';
import { useGenericFormsStore } from '@/stores/generic-forms';
import GenericForm from '@/components/generic-forms/GenericForm.vue';
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue';
import { useIdbDatasets } from '@/composables/datasets/useIdbDatasets';
import { useRemoteDatasets } from '@/composables/datasets/useRemoteDatasets';
import type { ProgressCallback, ErrorCallback } from '@/composables/datasets/useRemoteDatasets';
import type { Dataset as IdbDataset } from '@/database/db';
import ColorButton from '@/components/ui/ColorButton.vue';
import ObservationDeleteModal from '@/components/modals/ObservationDeleteModal.vue';
import ProgressBar from '@/components/ui/ProgressBar.vue';
import ModalOverlay from '@/components/modals/ModalOverlay.vue';
import { useModalsStore, MODAL_TYPES } from '@/stores/modals';
import { useRouter } from 'vue-router';

const props = defineProps<{
  genericFormUuid?: string | null,
  datasetUuid?: string,
  isIdbDataset?: boolean,
  taxon?: TaxonType,
}>();

const modals = useModalsStore();

const { createDataset, updateDataset, getDataset } = useIdbDatasets();
const { createRemoteDataset, updateRemoteDataset, getRemoteDataset } = useRemoteDatasets();

const genericFormsStore = useGenericFormsStore();
const { genericForm } = storeToRefs(genericFormsStore);

const formKey = ref<number>(0);

const dataset = ref<ReadOnlyDataset|IdbDataset|null>(null);
const isIdbDataset = ref<boolean>(props.isIdbDataset ?? false);

const formLoadError = ref<string | null> (null);
const loading = ref<boolean>(true);

const editSuccess = ref<boolean>(false);
const submitting = ref<boolean>(false);
const saved = ref<boolean>(false);
const imageError = ref<string | null>(null);

const observationSuccessfullyDeleted = ref<boolean>(false);

type ImageUploadProgress = {
  current: number
  total: number
  fileName: string
}

const imageUploadProgress = ref<ImageUploadProgress>({
  current: 0,
  total: 0,
  fileName: ''
});

const formLoadErrorMessage = t('observationForm.formLoadErrorMessage');

// Add ref for the GenericForm component
const genericFormRef = ref<InstanceType<typeof GenericForm> | null>(null);

const router = useRouter();

const reloadDataset = async (datasetUuid: string) => {
  if (isIdbDataset.value) {
    const datasetResult = await getDataset(datasetUuid);
    if (datasetResult) {
      dataset.value = datasetResult as IdbDataset;
      formKey.value++;
    }
    else {
      formLoadError.value = 'error reloading dataset from indexedDB';
    }
  } else {
    const datasetResult = await getRemoteDataset(datasetUuid);

    if (datasetResult.type === LCApiResultTypes.success) {
      dataset.value = datasetResult.data;
      formKey.value++;
    } else {
      formLoadError.value = 'error reloading dataset from server';
    }
  }
};

const loadForm = async () => {
  if (props.datasetUuid) {

    if (props.isIdbDataset) {
      // get datase by uuid from db
      const datasetResult = await getDataset(props.datasetUuid);
      
      if (datasetResult) {
        genericFormsStore.loadIdbGenericForm(datasetResult);
        dataset.value = datasetResult as IdbDataset;
      }
      else {
        formLoadError.value = 'error loading dataset from indexedDB';
      }

    } else {
      // If a dataset is provided, we load the generic form from the dataset
      const datasetResult = await getRemoteDataset(props.datasetUuid);

      if (datasetResult.type === LCApiResultTypes.success) {
        const observationFormUuid = datasetResult.data.observationForm.uuid;
        const observationFormVersion = datasetResult.data.observationForm.version;

        try {
          await genericFormsStore.loadRemoteGenericForm(observationFormUuid, observationFormVersion);
          dataset.value = datasetResult.data;

        } catch(error) {
          formLoadError.value = formLoadErrorMessage + ': ' + error;
        }
      } else {
        formLoadError.value = 'error loading dataset';
      }
    }
  } else {
    // If no dataset is provided, we try to load the generic form by UUID or default
    if (props.genericFormUuid) {
      try {
          await genericFormsStore.loadGenericForm(props.genericFormUuid);
      } catch (error) {
        formLoadError.value = formLoadErrorMessage + ': ' + error;
      }
    } else {
      try {
        await genericFormsStore.loadDefaultGenericForm();
      } catch (error) {
        formLoadError.value = formLoadErrorMessage + ': ' + error;
      }
    }
  }
};


const onSaveSuccess = async () => {
  saved.value = true;
};

const onImageProgress: ProgressCallback = (current: number, total: number, fileName?: string) => {
  // Progress callback - update modal
  const displayCurrent: number = current === total ? current : current + 1;

  imageUploadProgress.value = {
    current: displayCurrent,
    total,
    fileName: fileName || ''
  };
            
  if (current === 0 && total > 0) {
    // Start upload - show modal
    // Open modal manually to avoid history state manipulation, progrss is an automated modal
    modals.open = MODAL_TYPES.IMAGE_UPLOAD_PROGRESS;
    modals.id = '';
  } else if (current === total) {
    modals.open = '';
    modals.id = '';
  }
};

const onImageError: ErrorCallback = (error: string) => {
  // Error callback - show error in modal
  imageUploadProgress.value = { current: 0, total: 0, fileName: '' };
  modals.closeModal();
  imageError.value = error;
};


// Remote dataset creation
const handleCreateRemoteDataset = async (genericForm: GenericFormType, data: Record<string, any>, setServerErrors: Function) => {

  imageError.value = null;
  
  const createResult = await createRemoteDataset(genericForm, data, onImageProgress, onImageError);
  
  if (createResult.success && createResult.result) {
    const datasetUuid = createResult.result.data.uuid;

    onSaveSuccess();

    // Navigate to edit mode
    await router.replace({
      name: 'edit-remote-observation',
      params: { uuid: datasetUuid }
    });
  } else {
    console.error('Create failed:', createResult.result);
    setServerErrors(createResult.result);
  }
};

// IDB dataset creation (renamed for consistency)
const handleCreateIdbDataset = async (genericForm: GenericFormType, data: Record<string, any>) => {
  const createResult = await createDataset(genericForm, data);
  
  if (createResult.success && createResult.uuid) {

    const datasetUuid = createResult.uuid;

    onSaveSuccess();

    await router.replace({
      name: 'edit-local-observation',
      params: { uuid: datasetUuid }
    });

  } else {
    console.error('Create failed:', createResult.error);
    alert('Create failed: ' + createResult.error);
  }
};


const handleUpdateIdbDataset = async (dataset: IdbDataset, genericForm: GenericFormType, data: Record<string, any>, setServerErrors: Function) => {
  const updateResult = await updateDataset(dataset.uuid, genericForm, data);
  
  if (updateResult.success && updateResult.uuid) {
    await reloadDataset(updateResult.uuid);
    editSuccess.value = true;
    onSaveSuccess();
  } else {
    console.error('Save failed:', updateResult.error);
    alert('Save failed: ' + updateResult.error);
  }
};

const handleUpdateRemoteDataset = async (dataset: ReadOnlyDataset, genericForm: GenericFormType, data: Record<string, any>, setServerErrors: Function) => {
  const updateResult = await updateRemoteDataset(dataset.uuid, genericForm, data, onImageProgress, onImageError);
  
  if (updateResult.success && updateResult.result) {
    isIdbDataset.value = false; // Ensure we mark this as a remote dataset now
    await reloadDataset(updateResult.result.data.uuid);
    editSuccess.value = true;
    onSaveSuccess();
  } else {
    console.error('Update failed:', updateResult.result);
    setServerErrors(updateResult.result);
  }
};


const handleUpdate = async (dataset: ReadOnlyDataset | IdbDataset, genericForm: GenericFormType, data: Record<string, any>, setServerErrors: Function) => {
  if (props.isIdbDataset) {
    await handleUpdateIdbDataset(dataset as IdbDataset, genericForm, data, setServerErrors);
  } else {
    await handleUpdateRemoteDataset(dataset as ReadOnlyDataset, genericForm, data, setServerErrors);
  }
};

// Separate function for CREATE logic
const handleCreate = async (genericForm: GenericFormType, data: Record<string, any>, setServerErrors: Function) => {
  // @ts-ignore
  if (device.platform === 'browser') {
    // Create remote dataset
    await handleCreateRemoteDataset(genericForm, data, setServerErrors);
  } else {
    // Create IDB dataset
    await handleCreateIdbDataset(genericForm, data);
  }
};

const onSubmit = async (data: Record<string, any>, genericForm: GenericFormType, setServerErrors: Function) => {
  if (submitting.value) {
    return; // Early return instead of nested if
  }
  
  submitting.value = true;

  try {
    // Remove values of taxonomically hidden fields
    for (const uuid in genericFormsStore.taxonomicRestrictionStates) {
      const state = genericFormsStore.taxonomicRestrictionStates[uuid];
      if (state.hidden === true && uuid in data) {
        delete data[uuid];
      }
    }

    if (dataset.value) {
      // UPDATE existing dataset
      await handleUpdate(dataset.value, genericForm, data, setServerErrors);
    } else {
      // CREATE new dataset
      await handleCreate(genericForm, data, setServerErrors);
    }
  } finally {
    submitting.value = false;
  }
};

const unSave = () => {
  saved.value = false;
};

const onDelete = () => {
  observationSuccessfullyDeleted.value = true;
};

onMounted( async () => {
  loading.value = true;
  formLoadError.value = null;

  try {
    await loadForm();
  } catch (error) {
    formLoadError.value = formLoadErrorMessage + ': ' + error;
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <ContentContainer>
    <div class="page page-padding">
      <div v-if="observationSuccessfullyDeleted" class="container-small">
        <div class="alert alert-success my-xl">
          <h2>
            {{ $t('myObservations.deleteSuccess') }}
          </h2>
        </div>
        <div class="flex">
          <RouterLink
            :to="{ name: 'my-observations' }"
            class="nolinkstyle"
          >
            <ColorButton
              :text="t('myObservations.goToMyObservations')"
            >
            </ColorButton>
          </RouterLink>
        </div>
      </div>
      <div
        v-else
        class="container-small"
      >
        <div v-if="loading">
          <LoadingSpinner />
        </div>
        <div v-else class="mb-xl">
          <div v-if="genericForm">
            <h1 class="h1 my-xl">
              {{ genericForm.name }}
            </h1>
            <GenericForm
              :key="formKey"
              ref="genericFormRef"
              :generic-form="genericForm"
              :dataset="dataset"
              :is-idb-dataset="isIdbDataset"
              :taxon="taxon"
              :edit-success="editSuccess"
              :submitting="submitting"
              :saved="saved"
              @submit="onSubmit"
              @resetted="unSave"
            />
            <div v-if="saved" class="mt-xl">
              <div class="alert alert-success">
                {{ $t('observationForm.saveSuccess') }}
              </div>
            </div>
            <div>
              <div
                v-if="datasetUuid"
                class="mt-xl obs-delete-modal"
              >
                <ObservationDeleteModal
                  :dataset-uuid="datasetUuid"
                  :is-idb-dataset="isIdbDataset"
                  @deleted="onDelete"
                />
              </div>
            </div>
          </div>
          <div v-else>
            <div class="alert alert-error">
              {{ formLoadError }}
            </div>
          </div>
        </div>
      </div>
    </div>
    <ModalOverlay
      :modal-type="MODAL_TYPES.IMAGE_UPLOAD_PROGRESS"
      @update:modelValue="val => { if (!val) modals.closeModal(); }"
      @close="modals.closeModal"
    >
      <div>
        <div>
          {{ $t('observationForm.waitForImageUpload') }}
        </div>
        <ProgressBar
          :current="imageUploadProgress.current"
          :total="imageUploadProgress.total"
        />
        <div
          v-if="imageError"
          class="alert alert-error"
        >
          {{ imageError }}
        </div>
      </div>
    </ModalOverlay>
  </ContentContainer>
</template>

<style scoped>
.obs-delete-modal {
  display: flex;
  justify-content: flex-end;
}
</style>