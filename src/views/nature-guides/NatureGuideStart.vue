<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useNatureGuideStore } from '@/stores/nature-guides';
import ContentContainer from '@/components/container/ContentContainer.vue';
import IdentificationStep from './IdentificationStep.vue';
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue';

const route = useRoute();
const natureGuideStore = useNatureGuideStore();

const loading = ref<boolean>(true);

const { guideSlug } = route.params;

const startNodeSlug =  ref<string | null>(null);

onMounted( async () => {
  await natureGuideStore.loadNatureGuide(`${guideSlug}`);
  startNodeSlug.value = natureGuideStore.startNodeSlug;
  loading.value = false;
});
</script>

<template>
  <ContentContainer>
    <Suspense>
      <template #fallback>
        <div>
          <LoadingSpinner />
        </div>
      </template>        
      <IdentificationStep 
        v-if="!loading && startNodeSlug"
        :guide-slug="guideSlug as string"
        :node-slug="startNodeSlug"
      />
    </Suspense>
  </ContentContainer>
</template>
