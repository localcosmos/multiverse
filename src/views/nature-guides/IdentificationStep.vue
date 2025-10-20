<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import type { ComputedRef } from 'vue';
import { useRoute } from 'vue-router';
import { useNatureGuideStore } from '@/stores/nature-guides';
import { useModalBottomSheet } from '@/stores/modal-bottomsheet';
import { IdentificationStep } from 'localcosmos-client';
import { t } from 'i18next';
import ContentContainer from '@/components/container/ContentContainer.vue';
import { resolveComponent } from '@/utils/filterComponentResolver';

import NodeList from '@/components/nature-guide/NodeList.vue';
import ColorButton from '@/components/ui/ColorButton.vue';

import EvaluationPreview from '@/components/nature-guide/EvaluationPreview.vue';
import router from '@/router';

const props = defineProps<{
  guideSlug: string;
  nodeSlug: string;
}>();

const route = useRoute();

const modalBottomSheet = useModalBottomSheet();

const natureGuideStore = useNatureGuideStore();

await natureGuideStore.loadNatureGuide(`${props.guideSlug}`);
natureGuideStore.loadIdentificationStepBySlug(`${props.nodeSlug}`);

const identificationStep: ComputedRef<IdentificationStep | null> = computed(() => natureGuideStore.currentStep);

const renderKey = ref<number>(0); // Reactive key to force re-rendering

const resetIdentificationStep = () => {
  natureGuideStore.resetIdentificationStep();
  renderKey.value++;
};

onMounted(() => {
  const modalBottomSheetTitle = t('natureGuide.Evaluation');
  modalBottomSheet.create(NodeList, modalBottomSheetTitle, EvaluationPreview);
  
  // check if the modal is opened by the url
  const modalState = route.query.modalbottomsheet;

  modalBottomSheet.collapse();
    
  if (modalState === 'expanded') {
    console.log('Modal was expanded via back navigation - fixing route');
    router.back();
  }
});

onBeforeUnmount(() => {
  modalBottomSheet.destroy();
});
</script>

<template>
  <ContentContainer :key="renderKey">
    <div class="identification-step-container">
      <div
        v-if="identificationStep"
        class="identification-step full-height"
      >
        <div class="traits-container full-height scroll-y">
          <div class="identification-step-header">
            <div>
              <h1 class="font-medium text-xl">
                {{ identificationStep.name }}
              </h1>
            </div>
            <div>
              <ColorButton
                class="cursor-pointer"
                :text="t('reset')"
                @click="resetIdentificationStep"
              />
            </div>
          </div>
          
          <div class="trait-list mt-m">
            <template
              v-for="[uuid, filter] in Object.entries(identificationStep.matrixFilters)" :key="uuid"
            >
              <component
                :is="resolveComponent(filter.data.type)"
                :filter="filter"
                :read-only="false"
              />
            </template>
          </div>
        </div>

        <div class="nodelist-xl">
          <NodeList />
        </div>

      </div>
    </div>
  </ContentContainer>
</template>

<style scoped>
.identification-step-header {
  display: flex;
  gap: var(--size-md);
  justify-content: flex-start;
  align-items: center;
}

.identification-step-header h2 {
  margin: 0;
}

.nodelist-xl {
  display: none;
  height: 100%;
  overflow-y: scroll;
}

.identification-step-container {
  padding-top: var(--header-bar-height);
  height: 100vh;
  height: 100dvh;
}

.full-height {
  height: calc(100vh - var(--header-bar-height));
  height: calc(100dvh - var(--header-bar-height));
}

.identification-step {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0;
  width: 100vw;
  width: 100dvw;
}

.scroll-y {
  overflow-y: scroll;
}

.traits-container, .nodelist {
  padding-left: var(--size-md);
  padding-right: var(--size-md);
  padding-top: var(--size-md);
  padding-bottom: calc( var(--bottom-navigation-height) + var(--bottom-navigation-offset-bottom) + var(--collapsed-bottomsheet-height) + var(--size-md) );
}

.node-link {
  text-decoration: none;
  color: inherit;
  display: block;
}

.trait-list {
  display: grid;
  grid-template-columns: 1fr;
  gap: 56px;
}

@media (min-width: 640px) {
}

@media (min-width: 768px) {
  .identification-step-container {
    padding-top: 0;
    padding-left: var(--navigation-rail-width);
  }

  .identification-step {
    width: 100%;
  }

  .full-height {
    height: 100vh;
    height: 100dvh;
  }
}

@media (min-width: 1024px) {
}

@media (min-width: 1280px) {
  .nodelist-xl {
    display: flex;
  }

  .identification-step-container {
    padding-top: var(--desktop-header-bar-height);
    padding-left: 0;
  }

  .identification-step {
    grid-template-columns: 4fr 2fr;
  }

  .full-height {
    height: calc(100vh - var(--desktop-header-bar-height));
    height: calc(100dvh - var(--desktop-header-bar-height));
  }
}

@media (min-width: 1536px) {
}

</style>