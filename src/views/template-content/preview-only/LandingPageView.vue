<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { MultiversePage, IncidentReport, ArticleStream } from '@/types/template-content';
import { useTemplateContent } from '@/composables/useTemplateContent';
import type { TemplateContentSource } from '@/composables/useTemplateContent';
import TemplateContentContainer from '@/components/container/TemplateContentContainer.vue';
import VideoEmbed from '@/components/video/VideoEmbed.vue';
import TextBlock from '@/components/template-content/TextBlock.vue';
import TextHeading from '@/components/template-content/TextHeading.vue';

const router = useRouter();
const route = useRoute();
const { fetchTemplateContent } = useTemplateContent();

const loading = ref<boolean>(true);
const slug = route.params.slug as string;
const templateData = ref<MultiversePage | null>(null);
const templateSource = ref<TemplateContentSource | null>(null);
const acuteIncident = ref<IncidentReport | null>(null);
const welcomeBlock = ref<ArticleStream>([]);

const componentMap: Record<string, any> = {
  'Video': VideoEmbed,
  'TextBlock': TextBlock,
  'Heading': TextHeading,
};

const getPropsForType = (item: any) => {
  switch (item.templateName) {
    case 'Video': return { video: item };
    case 'TextBlock': return { textBlock: item, templateSource: templateSource.value };
    case 'Heading': return { heading: item };
    default: return {};
  }
};

onMounted(async () => {
  const result = await fetchTemplateContent(slug);
  templateData.value = result.templateData;
  templateSource.value = result.source;

  if (templateData.value) {
    acuteIncident.value = (templateData.value.contents.acuteIncident as IncidentReport) ?? null;
    welcomeBlock.value = (templateData.value.contents.welcomeBlock as ArticleStream) || [];
  } else {
    router.replace({ name: 'not-found' });
  }

  loading.value = false;
});
</script>

<template>
  <TemplateContentContainer :loading="loading" class="bg-translucent">
    <div v-if="templateData" class="container">
      <component
        v-for="(item, index) in welcomeBlock"
        :key="index"
        :is="componentMap[item.templateName]"
        :class="item.templateName"
        v-bind="getPropsForType(item)"
      />
    </div>
  </TemplateContentContainer>
</template>

<style scoped>
</style>
