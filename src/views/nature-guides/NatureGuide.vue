<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import ContentContainer from '@/components/container/ContentContainer.vue';
import IdentificationStep from './IdentificationStep.vue';
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue';

const route = useRoute();

const { guideSlug, nodeSlug } = route.params;

const componentKey = ref<string>(`${nodeSlug}`);

watch(
  () => route.params.nodeSlug,
  async (newSlug, oldSlug) => {
    componentKey.value = `${newSlug}`;
  }
);
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
          :key="componentKey"
          :guide-slug="guideSlug as string"
          :node-slug="nodeSlug as string"
        />
    </Suspense>
  </ContentContainer>
</template>