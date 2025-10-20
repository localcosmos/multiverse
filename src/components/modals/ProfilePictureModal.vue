<script setup lang="ts">
import { ref } from 'vue';
import { t } from 'i18next';
import { Cropper, CircleStencil } from 'vue-advanced-cropper';
import { PhImageSquare } from '@phosphor-icons/vue';
import type { Image } from '@/types/images';
import type { CropParameters } from 'localcosmos-client';
import type { CropperResult } from 'vue-advanced-cropper';
import { LCApiResultTypes } from 'localcosmos-client';
import { parseServerErrorsToString } from '@/composables/parseServerErrors';
import { fixImageOrientation } from '@/composables/fixImageOrientation';

import 'vue-advanced-cropper/dist/style.css';

import { useModalsStore, MODAL_TYPES } from '@/stores/modals';
import { useAuthStore } from '@/stores/auth';

import ModalOverlay from '@/components/modals/ModalOverlay.vue';
import ColorButton from '@/components/ui/ColorButton.vue';

const emit = defineEmits <{(e: 'updated'): void
}>();

const errorMessage = ref<string>('');
const imageError = ref<boolean>(false);

const authStore = useAuthStore();
const modals = useModalsStore();

const image = ref<Image>({
  src: null,
  type: null,
});

const imageInput = ref<HTMLInputElement>();

const cropParameters = ref<CropParameters|null>(null);

const change = ({ coordinates, canvas }: CropperResult) => {
  const parameters = {
    x: coordinates.left,
    y: coordinates.top,
    width: coordinates.width,
    height: coordinates.height,
  };

  cropParameters.value = parameters;
}

const getMimeType = (file: ArrayBuffer, fallback : string | null = null) => {
  const byteArray = (new Uint8Array(file)).subarray(0, 4);
  let header = '';
  for (let i = 0; i < byteArray.length; i++) {
    header += byteArray[i].toString(16);
  }
  switch (header) {
    case '89504e47':
      return 'image/png';
    case '47494638':
      return 'image/gif';
    case 'ffd8ffe0':
    case 'ffd8ffe1':
    case 'ffd8ffe2':
    case 'ffd8ffe3':
    case 'ffd8ffe8':
      return 'image/jpeg';
    default:
      return fallback;
  }
}

const loadImage = (event: Event) => {
  const input = event.target as HTMLInputElement | null;
  if (!input || !input.files) {
    imageError.value = true;
    errorMessage.value = t('MyAccount.invalidPictureFile');
    return;
  }

  imageError.value = false;

  const files = input.files;
  // Ensure that you have a file before attempting to read it
  if (files && files[0]) {
    // 1. Revoke the object URL, to allow the garbage collector to destroy the uploaded before file
    if (image.value.src) {
      URL.revokeObjectURL(image.value.src);
    }
    // 2. Create the blob link to the file to optimize performance:
    const blob = URL.createObjectURL(files[0]);

    // 3. The steps below are designated to determine a file mime type to use it during the
    // getting of a cropped image from the canvas. You can replace it them by the following string,
    // but the type will be derived from the extension and it can lead to an incorrect result:
    //
    // this.image = {
    //    src: blob;
    //    type: files[0].type
    // }

    // Create a new FileReader to read this image binary data
    const reader = new FileReader();
    // Define a callback function to run, when FileReader finishes its job
    reader.onload = (event) => {

      // Check if the reader has loaded the file data
      if (!event.target || !event.target.result) {
        // If not, then we cannot proceed with the image processing
        imageError.value = true;
        errorMessage.value = t('MyAccount.invalidPictureFile');
        return;
      }

      // If the reader has loaded the file data, then we can proceed with the image processing
      imageError.value = false;
      // type check if it is an array buffer
      if (!(event.target.result instanceof ArrayBuffer)) {
        imageError.value = true;
        errorMessage.value = t('MyAccount.invalidPictureFile');
        return;
      }

      const mimeType = getMimeType(event.target.result, files[0].type);

      image.value = {
        src: blob,
        type: mimeType,
      };
    };
    // Start the reader job - read file as a data url (base64 format)
    reader.readAsArrayBuffer(files[0]);
  }
}

async function save () {

  if (!imageInput.value) {
    imageError.value = true;
    errorMessage.value = t('MyAccount.invalidPictureFile');
    return;
  }

  // Check if the user has selected a file
  if (!imageInput.value.files || imageInput.value.files.length === 0) {
    imageError.value = true;
    errorMessage.value = t('MyAccount.invalidPictureFile');
    return;
  }
  
  if (imageInput.value.files.length) {
    imageError.value = false;

    let sourceImage = imageInput.value.files[0];
    let imageFilename = sourceImage.name;

    const fixedImage = await fixImageOrientation(sourceImage);

    if (fixedImage) {
      // If fixedImage is a Blob but not a File, convert it to a File
      if (!(fixedImage instanceof File)) {
        sourceImage = new File([fixedImage], imageFilename, { type: fixedImage.type });
      } else {
        sourceImage = fixedImage;
      }
      imageFilename = imageFilename.replace(/\.[^/.]+$/, '.jpg');
    }
    
    let submitCropParameters : CropParameters | undefined = undefined;

    if (cropParameters.value) {
      submitCropParameters = cropParameters.value;
    }

    const result = await authStore.uploadProfilePicture(imageFilename, sourceImage, submitCropParameters);

    if (result === null) {
      if (authStore.error) {
        imageError.value = true;
        errorMessage.value = authStore.error;
      }
      else {
        imageError.value = false;
      }
    }
    else {
      if (result.type === LCApiResultTypes.success) {
        emit('updated');
        modals.closeModal();
      }
      else {
        const errorMessageStr = parseServerErrorsToString(result.error);  
        errorMessage.value = errorMessageStr;
        imageError.value = true;
      }
    }

  } else {
    errorMessage.value = t('MyAccount.invalidPictureFile');
    imageError.value = true;
  }
}

</script>

<template>
  <div>
    <ModalOverlay
      :modal-type="MODAL_TYPES.PROFILE_PICTURE"
      @update:modelValue="val => { if (!val) modals.closeModal(); }"
    >
      <template #title>
        {{ $t('MyAccount.addProfilePicture') }}
      </template>
      <div>
        <div v-if="image.src" class="overflow-x-hidden">
          <Cropper
            ref="cropper"
            class="cropper"
            :src="image.src"
            :stencil-component="CircleStencil"
            :stencil-props="{aspectRatio: 1 / 1}"
            :check-orientation="true"
            @change="change"
          />
        </div>
        <div class="mt-m">
          <div class="form-control">
            <div>
              <PhImageSquare size="20" />
            </div>
            <div>
              <div class="relative">
                <input
                  ref="imageInput"
                  type="file"
                  accept="image/*"
                  @change="loadImage"
                >
              </div>
            </div>
          </div>
        </div>
        <div v-if="imageError" class="mt-5">
          <div class="alert alert-error">
            {{ errorMessage }}
          </div>
        </div>
      </div>
      <template #actions>
        <ColorButton
          @click="save"
          :text="t('save')"
          type="success"
        >
        </ColorButton>
        <ColorButton
          @click="modals.closeModal"
          :text="$t('cancel')"
        >
        </ColorButton>
      </template>
    </ModalOverlay>
    <ColorButton
      class="bg-accent"
      @click="modals.openModal(MODAL_TYPES.PROFILE_PICTURE)"
      :text="$t('MyAccount.changePicture')"
    >
    </ColorButton>
  </div>
</template>

<style scoped>
.cropper {
  height: 350px;
}
</style>
