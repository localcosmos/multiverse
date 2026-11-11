<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import type { ComputedRef } from 'vue';
import { useRoute } from 'vue-router';
import { useNatureGuideStore } from '@/stores/nature-guides';
import { useModalBottomSheet } from '@/stores/modal-bottomsheet';
import { IdentificationStep, IdentificationModes, IdentificationStepEvents, NodeType } from 'localcosmos-client';
import type { Node } from 'localcosmos-client';
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

const modalBottomSheet = useModalBottomSheet();
const route = useRoute();

const natureGuideStore = useNatureGuideStore();

await natureGuideStore.loadNatureGuide(`${props.guideSlug}`);
natureGuideStore.loadIdentificationStepBySlug(`${props.nodeSlug}`);

const identificationStep: ComputedRef<IdentificationStep | null> = computed(() => natureGuideStore.currentStep);

const isPolytomous = computed(() =>
  identificationStep.value?.identificationMode === IdentificationModes.polytomous
);

const polytomousFilter = computed(() => {
  if (!identificationStep.value) return null;
  const entries = Object.entries(identificationStep.value.matrixFilters);
  return entries.length > 0 ? entries[0][1] : null;
});

const renderKey = ref<number>(0);

const resetIdentificationStep = () => {
  natureGuideStore.resetIdentificationStep();
  renderKey.value++;
};

const goToNode = (node: Node) => {
  natureGuideStore.pushLastStep();
  if (natureGuideStore.natureGuide) {
    if (node.data.nodeType === NodeType.node) {
      router.push({ name: 'nature-guide', params: { guideSlug: natureGuideStore.natureGuide.slug, nodeSlug: node.slug } });
    } else {
      modalBottomSheet.destroy();
      router.push({ name: 'taxon-profile-nameuuid', params: { nameUuid: node.data.taxon.nameUuid } });
    }
  }
};

const onPolytomousResult = (result: Node | null) => {
  if (result) goToNode(result);
};

// Snapshot this component's own step at setup time, before the store can change.
// onBeforeUnmount fires after the incoming component's setup has already
// updated natureGuideStore.currentStep, so we must NOT read currentStep there.
const thisStep = natureGuideStore.currentStep;
const thisStepIsPolytomous = thisStep?.identificationMode === IdentificationModes.polytomous;

if (thisStepIsPolytomous && thisStep) {
  thisStep.on(IdentificationStepEvents.IdentificationResultChanged, onPolytomousResult);
}

onMounted(() => {
  if (!thisStepIsPolytomous) {
    const modalBottomSheetTitle = t('natureGuide.Evaluation');
    modalBottomSheet.create(NodeList, modalBottomSheetTitle, EvaluationPreview);

    // Restore sheet state from the URL — this handles back navigation returning
    // to a step that had the sheet open (feature 2), as well as the normal case.
    if (route.query.modalbottomsheet === 'expanded') {
      modalBottomSheet.expand();
    } else {
      modalBottomSheet.collapse();
    }
  }
});

onBeforeUnmount(() => {
  if (thisStepIsPolytomous && thisStep) {
    thisStep.off(IdentificationStepEvents.IdentificationResultChanged, onPolytomousResult);
  }
  modalBottomSheet.destroy();
});
</script>

<template>
  <ContentContainer :key="renderKey">
    <div class="identification-step-container">
      <div
        v-if="identificationStep"
        class="identification-step full-height"
        :class="{ polytomous: isPolytomous }"
      >

        <!-- polytomous mode: single filter, direct navigation on selection -->
        <template v-if="isPolytomous">
          <div class="traits-container full-height scroll-y">
            <div class="identification-step-header">
              <h2 class="font-medium text-xl">
                {{ identificationStep.name }}
              </h2>
            </div>
            <div class="polytomous trait-list mt-xl">
              <component
                v-if="polytomousFilter"
                :is="resolveComponent(polytomousFilter.data.type)"
                :filter="polytomousFilter"
                :read-only="false"
              />
            </div>
          </div>
        </template>

        <!-- matrix mode: full filter list + node list -->
        <template v-else>
          <div class="traits-container full-height scroll-y">
            <div class="identification-step-header">
              <div>
                <h2 class="font-medium text-xl">
                  {{ identificationStep.name }}
                </h2>
              </div>
              <div>
                <ColorButton
                  class="cursor-pointer"
                  :text="t('reset')"
                  @click="resetIdentificationStep"
                />
              </div>
            </div>

            <div class="trait-list mt-xl">
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
        </template>

      </div>
    </div>
  </ContentContainer>
</template>

<style>
@layer defaults {
 :root {
  --identification-bg: rgba(255,255,255,.6);

  --darkmode-identification-bg: rgba(0,0,0,.6);
 }
}

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
  height: 100vh;
  height: 100dvh;
  background: var(--identification-bg);
}

body.dark .identification-step-container {
  background: var(--darkmode-identification-bg);
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
  padding-left: var(--size-xl);
  padding-right: var(--size-xl);
  padding-top: var(--size-xl);
  padding-bottom: calc( var(--bottom-navigation-height) + var(--bottom-navigation-offset-bottom) + var(--collapsed-bottomsheet-height) + var(--size-xl) );
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

  .identification-step.polytomous {
    grid-template-columns: 1fr;
    max-width: 1280px;
    width: 100%;
    margin-inline: auto;
  }

  .full-height {
    height: calc(100vh - var(--desktop-header-bar-height));
    height: calc(100dvh - var(--desktop-header-bar-height));
  }
}

@media (min-width: 1536px) {
}

</style>
