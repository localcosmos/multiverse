<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import type { Page } from 'localcosmos-client';

import { useTemplateContent } from '@/composables/useTemplateContent';
import TemplateContentContainer from '@/components/container/TemplateContentContainer.vue';

const loading = ref<boolean>(true);

const route = useRoute();
const { fetchTemplateContent } = useTemplateContent();

const slug = route.params.slug as string; 

const templateData = ref<Page| null>(null);

onMounted(async() => {
  const result = await fetchTemplateContent(slug);
  templateData.value = result.templateData;

  loading.value = false;
});
</script>

<template>
  <TemplateContentContainer :loading="loading" class="bg-translucent">
    <div v-if="templateData">
      <div>
        <h1>{{ templateData.title }}</h1>
      </div>
      <div >
        <div v-html="templateData.contents.text"></div>
      </div>
    </div>
  </TemplateContentContainer>
</template>

<style scoped>

</style>
