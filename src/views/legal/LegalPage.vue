<script setup lang="ts">
import { inject } from 'vue'
import type { FrontendSettings } from 'localcosmos-client';
import ContentContainer from '@/components/container/ContentContainer.vue';

const props = defineProps<{
  textKey: string
}>();

const frontend =inject('frontend') as FrontendSettings;

const frontendText = frontend.userContent?.texts[props.textKey];

const fullTextKey = `burgerMenu.${props.textKey}`;

</script>

<template>
  <ContentContainer>
    <div class="container page-padding min-h-full">
      <h1>
        {{ $t(fullTextKey) }}
      </h1>
      <!-- eslint-disable-next-line vue/no-v-html -->
      <div v-html="frontendText" />
    </div>
  </ContentContainer>
</template>
