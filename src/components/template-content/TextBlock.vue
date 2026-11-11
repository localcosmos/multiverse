<script setup lang="ts">
import type { TextBlock } from "@/types/template-content";
import type { TemplateContentSource } from "@/composables/useTemplateContent";

defineProps<{
  textBlock: TextBlock;
  templateSource?: TemplateContentSource | null; // Optional prop to pass the source for template content images
}>();
</script>

<template>
  <div class="page-padding-x pb-xl">
    <div v-html="textBlock.text"></div>
    <div v-if="textBlock.image">
      <ImageWithLicence
        :image="textBlock.image"
        sizes="(max-width: 640px) 100vw, 640px"
        :is-template-content-image="true"
        :template-content-source="templateSource"
      />
    </div>
  </div>
</template>

<style scoped></style>
