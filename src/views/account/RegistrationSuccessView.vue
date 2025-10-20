<script setup lang="ts">
import TransitionedPage from '@/components/container/TransitionedPage.vue';
import ColorButton from '@/components/ui/ColorButton.vue';
import { t } from 'i18next';

import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
</script>

<template>
  <TransitionedPage>
    <div class="page page-padding">
      <div class="form-page-container">
        <h1 class="h1 my-xl">
          {{ $t('registration.successTitle') }}
        </h1>
        <div v-if="authStore.isAuthenticated" class="alert alert-success my-xl">
          {{ $t('registration.successText') }}
        </div>
        <div v-else class="alert alert-error my-xl">
          {{ $t('registration.notLoggedIn') }}
        </div>
        <div class="mt-xl flex">
          <RouterLink
            :to="{ name: 'home'}"
            class="nolinkstyle"
          >
            <ColorButton
              :text="t('registration.goToStart')"
            ></ColorButton>
          </RouterLink>
        </div>
      </div>
    </div>
  </TransitionedPage>
</template>