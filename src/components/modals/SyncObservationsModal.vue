<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useModalsStore, MODAL_TYPES } from '@/stores/modals';
import { useIdbDatasets } from '@/composables/datasets/useIdbDatasets';
import { useRemoteDatasets } from '@/composables/datasets/useRemoteDatasets';
import ModalOverlay from './ModalOverlay.vue';
import ProgressBar from '@/components/ui/ProgressBar.vue';
import ColorButton from '@/components/ui/ColorButton.vue';
import type { Dataset } from '@/database/db';
import { LCApiResultTypes } from 'localcosmos-client';

const modals = useModalsStore();
const { getUnsyncedDatasets, getUnsyncedDatasetImages, getAllUnsyncedImages, deleteDataset, markDatasetAsSynced, markDatasetImageAsSynced, getImageBlob } = useIdbDatasets();
const { createRemoteDataset, createRemoteDatasetImage } = useRemoteDatasets();

// emit when completed
const emit = defineEmits(['sync-complete']);

type DatasetSyncResult = {
  success: boolean;
  serverUuid?: string;
  error?: string;
};

// More specific error types
type DatasetSyncError = {
  datasetUuid: string;
  datasetName?: string;
  type: 'dataset';
  message: string;
};

type ImageSyncError = {
  datasetUuid: string;
  imageId: number;
  filename: string;
  fieldUuid: string;
  type: 'image';
  message: string;
};

type SyncError = DatasetSyncError | ImageSyncError;

const unsyncedObservations = ref<Dataset[]>([]);
const syncing = ref<boolean>(false);
const syncComplete = ref<boolean>(false);
const syncedCount = ref<number>(0);
const syncErrors = ref<SyncError[]>([]);


type SyncPhase = 'network-warning' | 'calculating' | 'syncing' | 'complete';

// Add a new phase for network warning
const syncProgress = ref({
  current: 0,
  total: 0,
  currentTask: '',
  phase: 'network-warning' as SyncPhase
});

const progressDetails = ref({
  totalDatasets: 0,
  processedDatasets: 0,
  totalImages: 0,
  processedImages: 0
});

const reset = () => {
  syncing.value = false;
  syncComplete.value = false;
  syncedCount.value = 0;
  syncErrors.value = [];
  
  progressDetails.value = {
    totalDatasets: 0,
    processedDatasets: 0,
    totalImages: 0,
    processedImages: 0
  };
  
  syncProgress.value = {
    current: 0,
    total: 0,
    currentTask: '',
    phase: 'network-warning'
  };
};

const closeModal = () => {
  // reset phase and progress
  reset();
  modals.closeModal();
};

const loadUnsyncedObservations = async () => {
  unsyncedObservations.value = await getUnsyncedDatasets();
};

const calculateTotalWork = async () => {
  syncProgress.value.phase = 'calculating';
  syncProgress.value.currentTask = 'Calculating sync work...';
  
  const datasets = await getUnsyncedDatasets();
  
  // Count all images for unsynced datasets
  let totalImages = 0;
  for (const dataset of datasets) {
    const images = await getUnsyncedDatasetImages(dataset.uuid);
    totalImages += images.length;
  }
  
  // Add orphaned images (from previous failed syncs)
  const orphanedImages = await getAllUnsyncedImages();
  totalImages += orphanedImages.length;
  
  progressDetails.value = {
    totalDatasets: datasets.length,
    processedDatasets: 0,
    totalImages,
    processedImages: 0
  };
  
  // Total work = datasets + images
  syncProgress.value.total = datasets.length + totalImages;
  syncProgress.value.current = 0;
  
  return { datasets, totalImages };
};

const updateProgress = () => {
  const { processedDatasets, processedImages } = progressDetails.value;
  syncProgress.value.current = processedDatasets + processedImages;
};

// Start actual sync after user confirms network warning
const confirmAndStartSync = async () => {

  if (unsyncedObservations.value.length === 0) {
    closeModal();
    return;
  }

  syncing.value = true;
  syncErrors.value = [];
  syncedCount.value = 0;
  
  const { datasets } = await calculateTotalWork();
  
  syncProgress.value.phase = 'syncing';
  unsyncedObservations.value = datasets;

  for (let i = 0; i < datasets.length; i++) {
    const dataset = datasets[i];
    
    try {
      syncProgress.value.currentTask = `Syncing dataset ${i + 1}/${datasets.length}: ${dataset.observationForm?.name || 'Unnamed'}`;
      
      // Sync to remote
      const result = await syncDatasetToRemote(dataset);
      
      if (result.success) {
        await deleteDataset(dataset.uuid);
        syncedCount.value++;
      } else {

        syncErrors.value.push({
          datasetUuid: dataset.uuid,
          datasetName: dataset.observationForm?.name || `Dataset ${i + 1}`,
          type: 'dataset',
          message: `Failed to sync dataset: ${result.error}`
        });
      }

      progressDetails.value.processedDatasets++;
      updateProgress();

      // Sync orphaned images after each dataset
      await syncUnsyncedImages();

    } catch (error) {
      progressDetails.value.processedDatasets++;
      updateProgress();
      
      syncErrors.value.push({
        datasetUuid: dataset.uuid,
        datasetName: dataset.observationForm?.name || `Dataset ${i + 1}`,
        type: 'dataset',
        message: `Error syncing dataset: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  }
  
  syncing.value = false;
  syncComplete.value = true;
  syncProgress.value.phase = 'complete';
  emit('sync-complete');
};

const syncDatasetToRemote = async (dataset: Dataset): Promise<DatasetSyncResult> => {
  if (dataset.id) {
    try {
      // Convert IDB dataset to format expected by createRemoteDataset
      const genericForm = dataset.observationForm;
      const data = dataset.data;

      // remember: idb images are not part of the form fields
      
      // Use your existing createRemoteDataset function!
      const result = await createRemoteDataset(
        genericForm, 
        data,
      );
      
      if (result.success && result.result) {

        const remoteDatasetUuid = result.result.data.uuid;

        // Update local dataset with server info
        await markDatasetAsSynced(dataset.id, remoteDatasetUuid);

        // upload all images of this dataset
        const images = await getUnsyncedDatasetImages(dataset.uuid);
        if (images.length > 0) {
          // iterate over images and upload one at a time
          for (let imgIndex = 0; imgIndex < images.length; imgIndex++) {
            const image = images[imgIndex];

            syncProgress.value.currentTask = `Uploading image ${imgIndex + 1}/${images.length}: ${image.filename}`;

            if (!image.id) {
              syncErrors.value.push({
                datasetUuid: dataset.uuid,
                imageId: 0, // No ID available
                filename: image.filename,
                fieldUuid: image.fieldUuid,
                type: 'image',
                message: `Image ${image.filename} has no ID, skipping`
              });
              
              progressDetails.value.processedImages++;
              updateProgress();
              continue;
            }

            // the image blob has already been resized before saving it to idb or storage
            const imageBlob = await getImageBlob(image);
            if (!imageBlob) {
              syncErrors.value.push({
                datasetUuid: dataset.uuid,
                imageId: image.id,
                filename: image.filename,
                fieldUuid: image.fieldUuid,
                type: 'image',
                message: `Failed to get image blob for ${image.filename}`
              });
              
              progressDetails.value.processedImages++;
              updateProgress();
              continue;
            }

            const uploadResult = await createRemoteDatasetImage(remoteDatasetUuid, image.fieldUuid, imageBlob, image.filename);

            if (uploadResult.type === LCApiResultTypes.success) {
              // Mark image as synced
              await markDatasetImageAsSynced(image.id);
            } else {
              syncErrors.value.push({
                datasetUuid: dataset.uuid,
                imageId: image.id,
                filename: image.filename,
                fieldUuid: image.fieldUuid,
                type: 'image',
                message: `Failed to upload ${image.filename}: ${uploadResult.error || 'Unknown error'}`
              });
            }
            
            progressDetails.value.processedImages++;
            updateProgress();
          }
        }
        
        return { 
          success: true, 
          serverUuid: result.result.data.uuid 
        };
      } else {

        const error = result.result ? result.result.error.toString() : 'Unknown error';

        return { 
          success: false, 
          error: error
        };
      }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  } else {
    return { 
      success: false, 
      error: 'Invalid dataset ID' 
    };
  }
};

const syncUnsyncedImages = async () => {
  const unsyncedImages = await getAllUnsyncedImages();
  
  if (unsyncedImages.length > 0) {
    syncProgress.value.currentTask = `Syncing ${unsyncedImages.length} orphaned images...`;
  }
  
  for (let i = 0; i < unsyncedImages.length; i++) {
    const image = unsyncedImages[i];

    syncProgress.value.currentTask = `Orphaned image ${i + 1}/${unsyncedImages.length}: ${image.filename}`;

    if (!image.id) {
      syncErrors.value.push({
        datasetUuid: image.datasetUuid,
        imageId: 0, // No ID available
        filename: image.filename,
        fieldUuid: image.fieldUuid,
        type: 'image',
        message: `Image ${image.filename} has no ID, skipping`
      });
      
      progressDetails.value.processedImages++;
      updateProgress();
      continue;
    }

    try {
      const imageBlob = await getImageBlob(image);
      if (!imageBlob) {
        syncErrors.value.push({
          datasetUuid: image.datasetUuid,
          imageId: image.id,
          filename: image.filename,
          fieldUuid: image.fieldUuid,
          type: 'image',
          message: `Failed to get blob for ${image.filename}`
        });
        
        progressDetails.value.processedImages++;
        updateProgress();
        continue;
      }

      const result = await createRemoteDatasetImage(image.datasetUuid, image.fieldUuid, imageBlob, image.filename);
      if (result.type === LCApiResultTypes.success) {
        await markDatasetImageAsSynced(image.id);
      } else {
        syncErrors.value.push({
          datasetUuid: image.datasetUuid,
          imageId: image.id,
          filename: image.filename,
          fieldUuid: image.fieldUuid,
          type: 'image',
          message: `Failed to upload ${image.filename}: ${result.error || 'Unknown error'}`
        });
      }
    } catch (error) {
      syncErrors.value.push({
        datasetUuid: image.datasetUuid,
        imageId: image.id,
        filename: image.filename,
        fieldUuid: image.fieldUuid,
        type: 'image',
        message: `Error uploading ${image.filename}: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
    
    progressDetails.value.processedImages++;
    updateProgress();
  }
};


const refreshUnsyncedData = async () => {
  const datasets = await getUnsyncedDatasets();
  unsyncedObservations.value = datasets;
};

watch(() => modals.isModalOpen(MODAL_TYPES.SYNC_OBSERVATIONS), async (isOpen: boolean) => {
  if (isOpen) {
    await refreshUnsyncedData();
  }
});

onMounted(() => {
  loadUnsyncedObservations();
});

// Computed properties for error grouping
const datasetErrors = computed(() => 
  syncErrors.value.filter(error => error.type === 'dataset') as DatasetSyncError[]
);

const imageErrors = computed(() => 
  syncErrors.value.filter(error => error.type === 'image') as ImageSyncError[]
);


const cancelSync = () => {
  syncProgress.value.phase = 'network-warning';
};
</script>

<template>
  <div>
    <div class="flex">
      <ColorButton
        type="success"
        @click="modals.openModal(MODAL_TYPES.SYNC_OBSERVATIONS)"
        :text="$t('sync.syncObservations')"
      >
      </ColorButton>
    </div>
    <ModalOverlay
      :modal-type="MODAL_TYPES.SYNC_OBSERVATIONS"
      @update:modelValue="val => { if (!val) closeModal(); }"
      @close="closeModal"
    >
      <template #title>
        <h2>{{ $t('sync.syncObservations') }}</h2>
      </template>
      <div class="sync-modal">       
        <!-- Calculating Phase -->
        <div v-if="syncProgress.phase === 'calculating'">
          <p>{{ syncProgress.currentTask }}</p>
          <div class="loading-spinner">⏳</div>
        </div>

        <div v-if="syncProgress.phase === 'network-warning'">
          <div v-if="unsyncedObservations.length" class="alert alert-danger">
            <div>{{ $t('sync.foundObservations', { count: unsyncedObservations.length }) }}</div>
            <div class="mt-xl">{{ $t('sync.networkWarningMessage') }}</div>
          </div>
          <div v-else>
            <div class="alert alert-info">
              {{ $t('sync.noUnsyncedObservations') }}
            </div>
          </div>
        </div>

        <!-- Syncing Phase -->
        <div v-if="syncProgress.phase === 'syncing'">
          <p>{{ $t('sync.syncingObservations') }}</p>
          
          <!-- Overall Progress Bar -->
          <ProgressBar
            :current="syncProgress.current"
            :total="syncProgress.total"
          />
          
          <div class="progress-details">
            <div class="progress-item">
              <span>Datasets: {{ progressDetails.processedDatasets }}/{{ progressDetails.totalDatasets }}</span>
            </div>
            <div class="progress-item">
              <span>Images: {{ progressDetails.processedImages }}/{{ progressDetails.totalImages }}</span>
            </div>
          </div>
          
          <p v-if="syncProgress.currentTask" class="current-task">
            {{ syncProgress.currentTask }}
          </p>
        </div>

        <!-- Sync Complete -->
        <div v-if="syncProgress.phase === 'complete'">
          <!-- Success when no errors -->
          <div v-if="syncErrors.length === 0" class="alert alert-success">
            <h3>{{ $t('sync.syncSuccess') }}</h3>
            <p>{{ $t('sync.syncedCount', { count: syncedCount }) }}</p>
          </div>
          <!-- Show errors if any -->
          <div v-else>
            <div class="alert alert-error">
              <h3>{{ $t('sync.syncErrors') }}</h3>
              
              <!-- Group errors by type -->
              <div v-if="datasetErrors.length > 0" class="error-group">
                <h4>Dataset Errors ({{ datasetErrors.length }}):</h4>
                <ul>
                  <li v-for="error in datasetErrors" :key="`dataset-${error.datasetUuid}`">
                    <strong>{{ error.datasetName || error.datasetUuid }}</strong>: {{ error.message }}
                  </li>
                </ul>
              </div>
              
              <div v-if="imageErrors.length > 0" class="error-group">
                <h4>Image Upload Errors ({{ imageErrors.length }}):</h4>
                <ul>
                  <li v-for="error in imageErrors" :key="`image-${error.datasetUuid}-${error.imageId}`">
                    <strong>{{ error.filename }}</strong>: {{ error.message }}
                  </li>
                </ul>
              </div>
            </div>
          </div>

        </div>
      </div>
      <template #actions>
        <div v-if="syncProgress.phase === 'network-warning'" class="sync-actions">
          <ColorButton
            :text="$t('cancel')"
            @click="closeModal"
          />
          <ColorButton
            v-if="unsyncedObservations.length > 0"
            :text="$t('sync.proceedWithSync')"
            type="success"
            :disabled="syncing"
            @click="confirmAndStartSync"
          />
        </div>
        <div v-if="syncProgress.phase === 'complete'" class="sync-actions">
          <ColorButton 
            :text="$t('close')"
            @click="closeModal"
          />
        </div>
      </template>
    </ModalOverlay>
  </div>
</template>

<style scoped>
.progress-details {
  margin: 1rem 0;
  display: flex;
  gap: 1rem;
  font-size: 0.9rem;
  flex-wrap: wrap;
}

.progress-item {
  padding: 0.5rem;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  white-space: nowrap;
}

.current-task {
  margin-top: 0.5rem;
  font-style: italic;
  color: #666;
}

.loading-spinner {
  text-align: center;
  font-size: 1.5rem;
  margin: 1rem 0;
}

.error-group {
  margin: 1rem 0;
}

.error-group h4 {
  margin: 0.5rem 0;
  font-weight: bold;
}

.error-group ul {
  margin: 0;
  padding-left: 1.5rem;
}

.sync-actions {
  display: flex;
  gap: var(--gap-medium);
  margin-top: 1rem;
  justify-content: center;
}

.success-icon, .warning-icon, .error-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}
</style>