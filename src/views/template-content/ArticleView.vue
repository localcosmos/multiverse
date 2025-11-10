<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import type { Page } from 'localcosmos-client';
import type { ArticleStream } from '@/types/template-content';
import { fetchTemplateContent } from '@/composables/fetchTemplateContent';
import TemplateContentContainer from '@/components/container/TemplateContentContainer.vue';
import { useRouter } from 'vue-router';

import VideoEmbed from '@/components/template-content/VideoEmbed.vue';
import TextBlock from '@/components/template-content/TextBlock.vue';
import TextHeading from '@/components/template-content/TextHeading.vue';
import LinkedTaxonProfilesList from '@/components/template-content/LinkedTaxonProfilesList.vue';

import LargeCard from '@/components/container/LargeCard.vue';

const router = useRouter();

const loading = ref<boolean>(true);

const route = useRoute();
const slug = route.params.slug as string; 
const templateData = ref<Page| null>(null);

const contentStream = ref<ArticleStream>([]);

// Map content types to components
const componentMap: Record<string, any> = {
  'Video': VideoEmbed,
  'TextBlock': TextBlock,
  'Heading': TextHeading
};

const getPropsForType = (item: any) => {

  switch (item.templateName) {
    case 'Video':
      return { video: item };
    case 'TextBlock':
      return { textBlock: item };
    case 'Heading':
      return { heading: item };
    default:
      return { content: item };
  }
};

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
      <LargeCard class="article pb-xxl">
        <div class="container-md sm-page-padding-x">
          <div class="py-xxl">
            <h1 class="mt-xxl">{{ templateData.title }}</h1>
          </div>
        </div>
        <div>
          <component
            v-for="(item, index) in contentStream"
            :key="index"
            :is="componentMap[item.templateName]"
            :class="item.templateName"
            v-bind="getPropsForType(item)"
          />
        </div>
        <div
          v-if="templateData.linkedTaxonProfiles && templateData.linkedTaxonProfiles.length > 0"
          class="container-md sm-page-padding-x"
        >
          <div class=mt-xxl>
            <h2>{{ $t('templateContent.linkedTaxonProfiles') }}</h2>
            <LinkedTaxonProfilesList
              :linked-taxon-profiles="templateData.linkedTaxonProfiles"
            />
          </div>
        </div>
      </LargeCard>
    </div>
  </TemplateContentContainer>
</template>

<style scoped>
.article .TextBlock {
    max-width: 800px;
    margin: 0 auto;
}

.article .Heading {
    max-width: 800px;
    margin: 0 auto;
}
</style>