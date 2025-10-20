<script setup lang="ts">
import { ref, inject, computed, onUpdated, onMounted, watch } from 'vue';
import type { GenericFormField, DatasetReadOnlyImage, LocalCosmosApi } from 'localcosmos-client';
import { LCApiResultTypes } from 'localcosmos-client'; 
import { useField } from 'vee-validate';
import type { DatasetImage } from '@/database/db';
import { useIdbDatasets } from '@/composables/datasets/useIdbDatasets';

import { useAuthStore } from '@/stores/auth';
import { useModalsStore } from '@/stores/modals';

import { PhImage, PhCameraPlus, PhImages } from '@phosphor-icons/vue';

import PicturePreview from '../fields/PicturePreview.vue';

const props = defineProps<{
  genericField: GenericFormField,
  serverImages?: DatasetReadOnlyImage[],
  datasetUuid?: string,
}>();

const LCApi = inject('LCApi') as LocalCosmosApi;

const authStore = useAuthStore();
const modals = useModalsStore();
const { getGenericFieldImages, deleteDatasetImage } = useIdbDatasets();

const { value, setValue, errorMessage } = useField(() => props.genericField.uuid);

const pictureField = ref<HTMLInputElement>();
const serverImages = ref<DatasetReadOnlyImage[]>(props.serverImages || []);
const localImages = ref<DatasetImage[]>([]);

const proxyAlbumField = ref<HTMLInputElement>();
const proxyCameraField = ref<HTMLInputElement>();

const isCameraCapable = computed(() => {
  // @ts-ignore
  if (device && (device.platform == 'Android' || device.platform == 'iOS')){
    return true;
  }
  return false;
});

const loadLocalImages = async () => {
  if (props.datasetUuid) {
    try {
      localImages.value = await getGenericFieldImages(props.datasetUuid, props.genericField.uuid);
    } catch (error) {
      console.error('Failed to load local images:', error);
      localImages.value = [];
    }
  } else {
    localImages.value = [];
  }
};

// Watch for changes in datasetUuid to reload local images
watch(() => props.datasetUuid, (newUuid) => {
  if (newUuid) {
    loadLocalImages();
  } else {
    localImages.value = [];
  }
});

const updatePictureInput = (fileList: FileList) => {
  if (pictureField.value) {
    pictureField.value.files = fileList;
    
    // Convert FileList to array and set the value
    const filesArray = Array.from(fileList);
    setValue(filesArray);
  }
};

const handleChange = (event: Event) => {
  const eventTarget = event.target as HTMLInputElement;
  const files = eventTarget.files;
  if (files) {
    const filesArray = Array.from(files);
    setValue(filesArray);
  }
};

const transferFiles = (event: Event) => {
  const eventTarget = event.target as HTMLInputElement;
  const files = eventTarget.files;

  if (files === null || files.length === 0) {
    return;
  }
  const dt = new DataTransfer();

  const pictureInput = pictureField.value;

  if (pictureInput && pictureInput.files && pictureInput.files.length) {
    for (let m = 0; m < pictureInput.files.length; m++) {
      const f = pictureInput.files[m];
      const oldFile = new File([f.slice(0, f.size, f.type)], f.name);
      dt.items.add(oldFile);
    }
  }

  for (let i = 0; i < files.length; i++) {
    const f = files[i];
    const newFile = new File([f.slice(0, f.size, f.type)], f.name);
    dt.items.add(newFile);
  }

  updatePictureInput(dt.files);
};

const removePicture = (index: number) => {
  const dt = new DataTransfer();

  const pictureInput = pictureField.value;

  if (pictureInput && pictureInput.files && pictureInput.files.length) {
    for (let m = 0; m < pictureInput.files.length; m++) {
      if (m === index) {
        continue;
      }
      const f = pictureInput.files[m];
      const oldFile = new File([f.slice(0, f.size, f.type)], f.name);
      dt.items.add(oldFile);
    }
  }

  updatePictureInput(dt.files);
};

const removeIdbPicture = async (image: DatasetImage) => {
  const index = localImages.value.indexOf(image);
  if (index !== -1) {
    if (image.id) {
      await deleteDatasetImage(image.id);
    }
    localImages.value.splice(index, 1);
  }
};

const deleteServerPicture = async (image: DatasetReadOnlyImage) => {
  const clientId = authStore.getDeviceUuid();
  let deleteResponse = null;

  if (authStore.isAuthenticated === true && authStore.token) {
    deleteResponse = await LCApi.deleteDatasetImage(image.dataset, image.id, clientId, authStore.token.access);
  } else {
    deleteResponse = await LCApi.deleteDatasetImage(image.dataset, image.id, clientId);
  }

  if (deleteResponse.type === LCApiResultTypes.success) {
    const remainingServerImages: DatasetReadOnlyImage[] = [];
    serverImages.value.forEach((remainingImage) => {
      if (remainingImage.id !== image.id) {
        remainingServerImages.push(remainingImage);
      }
    });

    serverImages.value = remainingServerImages;
    modals.closeModal();
  } else {
    alert(JSON.stringify(deleteResponse.error));
  }
};

const getObjectURL = (file: File): string => {
  return URL.createObjectURL(file);
};

const accept = 'image/png, image/jpeg';

onUpdated(() => {
  if (!value.value) {
    const dt = new DataTransfer();
    if (pictureField.value) {
      pictureField.value.files = dt.files;
    }
    if (proxyAlbumField.value) {
      proxyAlbumField.value.files = dt.files;
    }
    if (proxyCameraField.value) {
      proxyCameraField.value.files = dt.files;
    }
  }
});

onMounted(() => {
  if (props.datasetUuid) {
    loadLocalImages();
  }
});
</script>

<template>
  <div class="mb-xl">
    <div class="file-form-field">
      <div class="form-field-icon">
        <PhImages
          :size="22"
        />
      </div>
      <div class="form-field-label">
        <div>
          {{ $t(genericField.definition.label) }}
        </div>
        <div class="licence-remark">
          {{ $t('observationForm.pictureLicenceRemark') }}
        </div>
      </div>
      <div>
        &nbsp;
      </div>
      <div class="image-input-fields">
        <input
          ref="pictureField"
          type="file"
          :accept="accept"
          class="image-input-for-form"
          :required="genericField.definition.required"
          multiple
          @change="handleChange"
        >

        <div class="image-input-proxies mb-m">
          <label class="image-input-album image-input-proxy">
            <PhImage
              size="28"
            />
            <input
              ref="proxyAlbumField"
              type="file"
              name="album-images"
              :accept="accept"
              multiple
              @change="transferFiles"
            >
          </label>

          <label
            class="image-input-camera image-input-proxy"
            :class="isCameraCapable ? '' : 'hidden'"
          >
            <PhCameraPlus
              size="28"
            />
            <input
              ref="proxyCameraField"
              type="file"
              name="camera-images"
              :accept="accept"
              capture="environment"
              @change="transferFiles"
            >
          </label>
        </div>
        <div
          v-if="serverImages && serverImages.length"
          class="server-images mb-m"
        >
          <div
            v-for="(image, index) in serverImages"
            :key="index"
          >
            <PicturePreview
              :url="image.imageUrl['2x']"
              :image="image"
              @remove="deleteServerPicture(image)"
            />
          </div>
        </div>
        <div
          v-if="localImages && localImages.length"
          class="selected-images mb-m"
        >
          <div
            v-for="(image, index) in localImages"
            :key="index"
          >
            <PicturePreview
              :local-image="image"
              @remove="removeIdbPicture(image)"
            />
          </div>
        </div>
        <div class="selected-images">
          <div
            v-for="(v, index) in value"
            :key="index"
          >
            <PicturePreview
              :url="getObjectURL(v)"
              @remove="removePicture(index)"
            />
          </div>
        </div>
        <div v-if="errorMessage" class="help-text">
          <span class="error-message">{{ errorMessage }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.image-input-fields {
  position: relative;
}

.selected-images, .server-images {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 20px var(--gap-medium);
}

.image-input-for-form {
  opacity:0;
  position: absolute;
  left: 0;
  top: 0;
  z-index: -1;
  width: 0;
  height: 0;
}

.image-input-proxy {
  cursor: pointer;
  display: flex;
  flex-direction: row;
  aspect-ratio: 1/1;
  justify-content: center;
  align-items: center;
  width: 48px;
  border-radius: 50px;
  border: 2px solid black;
  text-align: center;
  background: #FFF;
  position: relative;
}

.image-input-proxies {
  display: flex;
  flex-direction: row;
  gap: var(--gap-medium);
}

.image-input-proxy span {
  font-size: 28px;
}

.image-input-proxy input {
  opacity: 0;
  position: absolute;
  width: 0;
  height:0;
  z-index: -1;
}

.licence-remark {
  font-size: 10px;
  font-weight: 400;
  padding: 8px 0px;
}

.hidden {
  display: none;
}

.error-message {
  color: var(--color-error);
  font-size: 0.875rem;
}

@media (min-width: 576px) {

}

@media (min-width: 768px) {
  .selected-images, .server-images {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (min-width: 1024px) {
  .selected-images, .server-images {
    grid-template-columns: repeat(5, 1fr);
  }
}

@media (min-width: 1280px) {
  .selected-images, .server-images {
    grid-template-columns: repeat(5, 1fr);
  }
}

@media (min-width: 1536px) {

}
</style>
