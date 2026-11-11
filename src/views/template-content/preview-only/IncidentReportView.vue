<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { MultiversePage } from '@/types/template-content';
import type { ImageWithTextAndLicence } from 'localcosmos-client';
import { useTemplateContent } from '@/composables/useTemplateContent';
import type { TemplateContentSource } from '@/composables/useTemplateContent';
import TemplateContentContainer from '@/components/container/TemplateContentContainer.vue';
import IncidentReportDisplay from '@/components/template-content/IncidentReportDisplay.vue';

const router = useRouter();
const route = useRoute();
const { fetchTemplateContent } = useTemplateContent();

const loading = ref<boolean>(true);
const slug = route.params.slug as string;
const templateData = ref<MultiversePage | null>(null);
const templateSource = ref<TemplateContentSource | null>(null);
const incidentText = ref<string | null>(null);
const incidentImage = ref<ImageWithTextAndLicence | null>(null);
const incidentDate = ref<string | null>(null);

onMounted(async () => {
  const result = await fetchTemplateContent(slug);
  templateData.value = result.templateData;
  templateSource.value = result.source;

  if (templateData.value) {
    incidentText.value = (templateData.value.contents.text as string) ?? null;
    incidentImage.value = (templateData.value.contents.image as ImageWithTextAndLicence) ?? null;
    const publishedAt = templateData.value.publishedAt ?? null;
    incidentDate.value = publishedAt ? new Date(publishedAt).toLocaleDateString() : null;
  } else {
    router.replace({ name: 'not-found' });
  }

  loading.value = false;
});
</script>

<template>
  <TemplateContentContainer :loading="loading">
    <IncidentReportDisplay
      v-if="templateData"
      :heading="templateData.title"
      :text="incidentText"
      :date="incidentDate"
      :image="incidentImage"
      :template-source="templateSource"
    />
  </TemplateContentContainer>
</template>

<style scoped>
</style>
