<script setup lang="ts">
import { ref } from 'vue';
import { t } from 'i18next';
import ColorButton from '@/components/ui/ColorButton.vue';
import { LCApiResultTypes } from 'localcosmos-client';
import { parseServerErrorsToString } from '@/composables/parseServerErrors';
import ModalOverlay from '@/components/modals/ModalOverlay.vue';

import { useModalsStore, MODAL_TYPES } from '@/stores/modals';
import { useAuthStore } from '@/stores/auth';

const emit = defineEmits <{(e: 'updated'): void
}>();

const modals = useModalsStore();
const authStore = useAuthStore();

const errorMessage = ref<string | null>(null);

const deleteProfilePicture = async () => {
  errorMessage.value = null;
  const result = await authStore.deleteProfilePicture();

  if (result === null) {
    if (authStore.error) {
      errorMessage.value = authStore.error;
    }
  }
  else if (result.type === LCApiResultTypes.error) {
    const errorMessageStr = parseServerErrorsToString(result.error);  
    errorMessage.value = errorMessageStr;
  } else {
    emit('updated');
    modals.closeModal();
  }

  setTimeout(() => {
    errorMessage.value = null;
  }, 3000);
};

</script>

<template>
  <div>
    <ColorButton
      type="error"
      @click="modals.openModal(MODAL_TYPES.DELETE_PROFILE_PICTURE)"
      :text="$t('MyAccount.deleteProfilePicture')"
    >
    </ColorButton>
    <ModalOverlay
      :modal-type="MODAL_TYPES.DELETE_PROFILE_PICTURE"
      @update:modelValue="val => { if (!val) modals.closeModal(); }"
    >
      <template #title>
        {{ t('MyAccount.deleteProfilePicture') }}
      </template>
      <div class="my-xl">
        <h1>{{ $t('MyAccount.confirmDeletePicture') }}</h1>
        <div class="my-xl">
          <div class="alert alert-warning">
            {{ $t('MyAccount.deletePictureWarning') }}
          </div>
        </div>   
      </div>
      <div v-if="errorMessage" class="alert alert-danger">
        {{  errorMessage }}
      </div>
      <template #actions>
        <ColorButton
          type="error"
          @click="deleteProfilePicture"
          :text="$t('delete')"
        ></ColorButton>
        <ColorButton
          type="default"
          @click="modals.closeModal"
          :text="$t('cancel')"
        ></ColorButton>
      </template>
    </ModalOverlay>
  </div>
</template>
