<script setup lang="ts">
import { ref } from 'vue';
import ContentContainer from '@/components/container/ContentContainer.vue';
import PasswordResetFlow from '@/components/modals/PasswordResetFlow.vue';

const resetSuccess = ref<boolean>(false);

const onResetFlowSuccess = () => {
  resetSuccess.value = true;
};
</script>

<template>
  <ContentContainer class="bg-translucent">
    <div class="page page-padding">
      <div class="container-small">
        <div>
          <h1 class="h1">
            {{ $t('passwordReset.title') }}
          </h1>
          <div class="my-xl">
            {{ $t('passwordReset.intro') }}
          </div>
        </div>
        <div class="my-xl">
          <div v-if="resetSuccess">
            <div class="alert alert-success">
              {{ $t('passwordReset.successMessage') }}
            </div>
          </div>
          <div v-else>
            <PasswordResetFlow
              context="manual"
              :show-back-button="false"
              @success="onResetFlowSuccess"
            />
          </div>
        </div>
      </div>
    </div>
  </ContentContainer>
</template>

