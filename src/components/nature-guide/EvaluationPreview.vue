<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { t } from 'i18next';
import { useNatureGuideStore } from '@/stores/nature-guides';
import { IdentificationStepEvents, NodeEvents, Node } from 'localcosmos-client';
import type { IdentificationStep } from 'localcosmos-client';
import { calculatePercentageColor } from '@/composables/calculatePercentageColor';

const modalBottomSheetTitle = t('natureGuide.Evaluation');
const noResultYetText = t('natureGuide.NoResultYet');

const natureGuideStore = useNatureGuideStore();

const result = ref<Node | null>(null);
const tiedCount = ref<number>(0);
const defaultBackgroundColor = '#FFF'; // Default background color

// Calculate the pointsColor for the progress bar
const pointsColor = computed(() => {
  if (result.value && result.value.data) {
    return calculatePercentageColor(result.value.points, result.value.data.maxPoints);
  }
  return defaultBackgroundColor;
});

// Calculate the progress percentage for the width
const progressPercentage = computed(() => {
  if (result.value && result.value.data) {
    return (result.value.points / result.value.data.maxPoints) * 100;
  }
  return 0; // Default to 0% if no result
});

// Format the "points / maxPoints" text
const pointsText = computed(() => {
  if (result.value && result.value.data) {
    return `${result.value.points} / ${result.value.data.maxPoints}`;
  }
  return '';
});

const tieLabel = computed(() => {
  return tiedCount.value > 1 ? `+${tiedCount.value - 1}` : null;
});

const updateState = () => {
  const step = natureGuideStore.currentStep;
  if (!step) return;
  result.value = step.currentResult;
  tiedCount.value = step.topNodes.length;
};

const attachNodeListeners = (step: IdentificationStep) => {
  for (const node of step.nodes) {
    node.on(NodeEvents.NodePointsChanged, updateState);
  }
};

const detachNodeListeners = (step: IdentificationStep) => {
  for (const node of step.nodes) {
    node.off(NodeEvents.NodePointsChanged, updateState);
  }
};

const attachListeners = () => {
  const step = natureGuideStore.currentStep;
  if (!step) return;
  step.on(IdentificationStepEvents.IdentificationResultChanged, updateState);
  attachNodeListeners(step);
};

const detachListeners = () => {
  const step = natureGuideStore.currentStep;
  if (!step) return;
  step.off(IdentificationStepEvents.IdentificationResultChanged, updateState);
  detachNodeListeners(step);
};

// Watch for changes to the currentStep in the natureGuideStore
watch(
  () => natureGuideStore.currentStep,
  (newStep, oldStep) => {
    if (oldStep) {
      oldStep.off(IdentificationStepEvents.IdentificationResultChanged, updateState);
      detachNodeListeners(oldStep);
    }
    if (newStep) {
      newStep.on(IdentificationStepEvents.IdentificationResultChanged, updateState);
      attachNodeListeners(newStep);
      updateState();
    }
  }
);

onMounted(() => {
  attachListeners();
  updateState();
});

onUnmounted(() => {
  detachListeners();
});
</script>

<template>
  <div class="evaluation-preview">
    <div
      class="progress-bar"
      :style="{ width: progressPercentage + '%', backgroundColor: pointsColor }"
    ></div>
    <div class="evaluation-content">
      <span class="evaluation-title">{{ modalBottomSheetTitle }}:</span>
      <span v-if="result" class="evaluation-name">{{ result.name }}</span>
      <span v-else class="evaluation-name">{{ noResultYetText }}</span>
      <span v-if="tieLabel" class="tie-label">{{ tieLabel }}</span>
      <span v-if="result" class="points-text">({{ pointsText }})</span>
    </div>
  </div>
</template>

<style scoped>
.evaluation-preview {
  position: relative;
  background: #FFF; /* Default background */
  display: flex;
  align-items: center;
  width: 100%;
  height: 100%;
  border-radius: var(--border-radius-xs);
  box-shadow: var(--box-shadow);
  padding-left: var(--size-md);
  padding-right: var(--size-md);
  overflow: hidden; /* Ensure the progress bar doesn't overflow */
}

.progress-bar {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  transition: width 0.3s ease; /* Smooth transition for progress updates */
  z-index: 1; /* Ensure it stays behind the content */
}

.evaluation-content {
  position: relative;
  z-index: 2; /* Ensure content is above the progress bar */
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  overflow: hidden;
}

.evaluation-title {
  flex-shrink: 0;
  white-space: nowrap;
}

.evaluation-name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.points-text {
  flex-shrink: 0;
  white-space: nowrap;
  font-size: 0.9rem;
  color: #666; /* Subtle color for the points text */
}

.tie-label {
  flex-shrink: 0;
  white-space: nowrap;
  font-size: 0.85rem;
  font-weight: 600;
  background: rgba(0, 0, 0, 0.12);
  border-radius: 999px;
  padding: 0 6px;
}
</style>
