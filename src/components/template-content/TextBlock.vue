<script setup lang="ts">
import type { TextBlock } from '@/types/template-content';

const props = defineProps<{
  textBlock: TextBlock
}>();
</script>


<template>
  <div>
    <div v-html="textBlock.text"></div>
    <div v-if="textBlock.image">
      <ImageWithLicence
        :image="textBlock.image"
        sizes="(max-width: 640px) 100vw, 640px"
        rounded="rounded-sm"
        :isTemplateContentImage="true"
      />
    </div>
  </div>
</template>

<style scoped>
</style>
