<script setup lang=ts>
import type { TemplateContentPreviewData } from '@/types/template-content';
import TemplateContentLink from '../ui/TemplateContentLink.vue';

const props = defineProps<{
  previewData: TemplateContentPreviewData
}>();
</script>

<template>
  <TemplateContentLink
    class="template-content-preview"
    :templateName="previewData.templateName"
    :slug="previewData.slug"
  >
    <div class="tc-preview-image">

    </div>
    <div class="tcp-text">
      <div class="tcp-title font-size-xl">
        {{ previewData.title }}
      </div>
      <div class="tcp-abstract" v-html="previewData.abstract">
      </div>
    </div>
  </TemplateContentLink>
</template>

<style scoped>
.template-content-preview {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  text-decoration: none;
  color: inherit;
  gap: var(--size-md);
}

.tc-preview-image {
  width: 100px;
  aspect-ratio: 1 / 1;
  background: rgb(220, 220, 220);
  border-radius: var(--border-radius-sm);
}

.tcp-text {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  gap: var(--size-sm);
}

.tcp-title {

  font-weight: var(--font-weight-medium);
}

.tcp-abstract {
  
}
</style>