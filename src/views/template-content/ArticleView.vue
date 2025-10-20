<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import type { Page } from 'localcosmos-client';
import type { ArticleStream } from '@/types/template-content';
import { fetchTemplateContent } from '@/composables/fetchTemplateContent';
import TemplateContentContainer from '@/components/container/TemplateContentContainer.vue';
import { useRouter } from 'vue-router';
const router = useRouter();

const loading = ref<boolean>(true);

const route = useRoute();
const slug = route.params.slug as string; 
const templateData = ref<Page| null>(null);

const contentStream = ref<ArticleStream>([]);

onMounted(async() => {
  templateData.value  = await fetchTemplateContent(slug);
  if (templateData.value) {
    contentStream.value = templateData.value.contents.content as ArticleStream || [];
  }
  else {
    // 404 Not Found
    router.replace({ name: 'not-found' });
  }
  loading.value = false;
});
</script>

<template>
  <TemplateContentContainer :loading="loading">
    <div v-if="templateData" class="container page-padding">
      <div>
        <h1>{{ templateData.title }}</h1>
      </div>
      <div>
        stream
      </div>
    </div>
  </TemplateContentContainer>
</template>