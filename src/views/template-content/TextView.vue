<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import type { Page } from 'localcosmos-client';

import { fetchTemplateContent } from '@/composables/fetchTemplateContent';

import TemplateContentContainer from '@/components/container/TemplateContentContainer.vue';

const loading = ref<boolean>(true);

const route = useRoute();
const slug = route.params.slug as string; 

const templateData = ref<Page| null>(null);

onMounted(async() => {
  templateData.value  = await fetchTemplateContent(slug);  
  loading.value = false;
});
</script>

<template>
  <TemplateContentContainer :loading="loading">
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
