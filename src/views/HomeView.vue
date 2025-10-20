<script setup lang="ts">
import { inject } from 'vue';
import ContentContainer from '@/components/container/ContentContainer.vue';
import LandingPage from '@/components/LandingPage.vue';

const isInPreviewMode = inject('isInPreviewMode') as boolean;

</script>

<template>
  <ContentContainer>
    <div>
        <div
          v-if="isInPreviewMode"
          class="page-full page-padding"
        >
          <div class="preview-indicator">
            <div>
              App in preview mode
            </div>
          </div>
          
        </div>
        <LandingPage v-else />
      </div>
  </ContentContainer>
</template>

<style scoped>
.preview-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}
</style>