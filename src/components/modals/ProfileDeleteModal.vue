<script setup lang="ts">
import { ref } from 'vue';
import ModalOverlay from '@/components/modals/ModalOverlay.vue';
import ColorButton from '@/components/ui/ColorButton.vue';
import { parseServerErrors } from '@/composables/parseServerErrors';

import { useAuthStore } from '@/stores/auth';
import { MODAL_TYPES, useModalsStore } from '@/stores/modals';

const authStore = useAuthStore();
const modals = useModalsStore();
const errorMessage = ref<any>(null)

const deleteAccount = async () => {
  await authStore.deleteUser();
  if (authStore.error) {
    errorMessage.value = authStore.error;
  } else if (authStore.serverErrors) {
    errorMessage.value = parseServerErrors(authStore.serverErrors);
  }
};

const openModal = () => {
  modals.openModal(MODAL_TYPES.DELETE_ACCOUNT);
};

</script>

<template>
  <div>
    <ColorButton type="danger" @click="openModal" :text="$t('MyAccount.deleteAccount')">
    </ColorButton>
    <ModalOverlay
      :modal-type="MODAL_TYPES.DELETE_ACCOUNT"
      @update:modelValue="val => { if (!val) modals.closeModal(); }"
    >
      <template #title>
        {{ $t('MyAccount.deleteAccount') }}
      </template>
      <div>
        <h1>{{ $t('MyAccount.confirmDelete') }}</h1>
        <div class="my-xl">
          <div class="alert alert-warning">
            {{ $t('MyAccount.deleteWarning') }}
          </div>
        </div>
        <div
          v-if="errorMessage"
          class="alert alert-error"
        >
          {{ errorMessage }}
        </div>
      </div>
      <template #actions>
        <ColorButton type="danger" @click="deleteAccount" :text="$t('delete')">
        </ColorButton>
        <ColorButton @click="modals.closeModal" :text="$t('cancel')">
        </ColorButton>
      </template>
    </ModalOverlay>
  </div>
</template>
