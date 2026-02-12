<script setup lang="ts">
import { useRouter } from 'vue-router';
import ContentContainer from '@/components/container/ContentContainer.vue';
import { t } from 'i18next';
import ColorButton from '@/components/ui/ColorButton.vue';

const router = useRouter();

const goHome = () => {
  router.push({ name: 'home' });
};

const goBack = () => {
  if (window.history.length > 1) {
    router.back();
  } else {
    goHome();
  }
};
</script>

<template>
  <ContentContainer>
    <div class="page page-padding">
      <div class="container-small">
        <div class="text-center py-2xl">
          <div class="mb-xl">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="text-error">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="currentColor"/>
              <path d="M11 7h2v6h-2zM11 15h2v2h-2z" fill="currentColor"/>
            </svg>
          </div>
          
          <h1 class="h1 mb-lg text-error">
            {{ t('permissionDenied.title') }}
          </h1>
          
          <p class="text-lg mb-xl text-muted">
            {{ t('permissionDenied.message') }}
          </p>
          
          <p class="mb-xl">
            {{ t('permissionDenied.description') }}
          </p>
          
          <div class="button-container">
            <ColorButton 
              @click="goBack" 
              color="secondary"
              class="mb-md"
              :text="t('common.goBack')"
            >
            </ColorButton>
            
            <ColorButton 
              @click="goHome" 
              color="primary"
              :text="t('common.goHome')"
            >
            </ColorButton>
          </div>
        </div>
      </div>
    </div>
  </ContentContainer>
</template>

<style scoped>
.text-error {
  color: var(--color-error, #ef4444);
}

.text-muted {
  color: var(--color-text-muted, #6b7280);
}

.button-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

@media (min-width: 640px) {
  .button-container {
    flex-direction: row;
    justify-content: center;
  }
}
</style>