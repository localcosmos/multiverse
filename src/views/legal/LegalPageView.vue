<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import ContentContainer from '@/components/container/ContentContainer.vue';
import LegalPage from './LegalPage.vue';

const route = useRoute();
const textKey = route.params.id as string;

const componentKey = ref<string>(textKey);

watch(
  () => route.params.id,
  async (newId, oldId) => {
    componentKey.value = `${newId}`;
  }
);
</script>

<template>
  <ContentContainer>
    
    <LegalPage :key="componentKey" :text-key="componentKey" />

  </ContentContainer>
</template>