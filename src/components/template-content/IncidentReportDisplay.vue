<script setup lang="ts">
import type { ImageWithTextAndLicence } from 'localcosmos-client';
import type { TemplateContentSource } from '@/composables/useTemplateContent';
import ImageWithLicence from '@/components/images/ImageWithLicence.vue';

defineProps<{
  heading?: string | null;
  text?: string | null;
  date?: string | null;
  image?: ImageWithTextAndLicence | null;
  templateSource?: TemplateContentSource | null;
}>();
</script>

<template>
  <div class="incident-report-container">
    <div class="text-center">
      <div v-if="date" class="font-size-md incident-report__date">{{ date }}</div>
      <h2 v-if="heading">{{ heading }}</h2>
      <ImageWithLicence
        v-if="image"
        :image="image"
        :is-template-content-image="!!templateSource"
        :template-content-source="templateSource"
        class="mt-xl"
      />
      <div v-if="text" v-html="text" class="mt-xl"></div>
    </div>
  </div>
</template>

<style scoped>
.incident-report-container {
  background: var(--color-error);
  padding: var(--size-xl);
  margin: 0 auto;
}

.incident-report__date {
  font-weight: bold;
  margin-bottom: var(--size-md);
}
</style>
