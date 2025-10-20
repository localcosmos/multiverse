<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { t } from 'i18next';
import { useNatureGuideStore } from '@/stores/nature-guides';
import { IdentificationStepEvents, Node } from 'localcosmos-client';
import { calculatePercentageColor } from '@/composables/calculatePercentageColor';

const modalBottomSheetTitle = t('natureGuide.Evaluation');
const noResultYetText = t('natureGuide.NoResultYet');

const natureGuideStore = useNatureGuideStore();

const result = ref<Node | null>(null);
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

// Function to update the result when the identification step changes
const updateModalBottomSheet = () => {
  if (natureGuideStore.currentStep) {
    result.value = natureGuideStore.currentStep.currentResult;
  }
};

// Function to attach event listeners to the current identification step
const attachListeners = () => {
  if (natureGuideStore.currentStep) {
    natureGuideStore.currentStep.on(IdentificationStepEvents.IdentificationResultChanged, updateModalBottomSheet);
  }
};

// Function to detach event listeners from the current identification step
const detachListeners = () => {
  if (natureGuideStore.currentStep) {
    natureGuideStore.currentStep.off(IdentificationStepEvents.IdentificationResultChanged, updateModalBottomSheet);
  }
};

// Watch for changes to the currentStep in the natureGuideStore
watch(
  () => natureGuideStore.currentStep,
  (newStep, oldStep) => {
    // Detach listeners from the old step
    if (oldStep) {
      oldStep.off(IdentificationStepEvents.IdentificationResultChanged, updateModalBottomSheet);
    }
    // Attach listeners to the new step
    if (newStep) {
      newStep.on(IdentificationStepEvents.IdentificationResultChanged, updateModalBottomSheet);
      updateModalBottomSheet(); // Update the result immediately
    }
  }
);

onMounted(() => {
  attachListeners(); // Attach listeners when the component is mounted
  updateModalBottomSheet(); // Initialize the result
});

onUnmounted(() => {
  detachListeners(); // Detach listeners when the component is unmounted
});
</script>

<template>
  <div class="evaluation-preview">
    <div
      class="progress-bar"
      :style="{ width: progressPercentage + '%', backgroundColor: pointsColor }"
    ></div>
    <div class="evaluation-content">
      {{ modalBottomSheetTitle }}:
      <span v-if="result">{{ result.name }}</span>
      <span v-else>{{ noResultYetText }}</span>
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
  gap: 8px; /* Add spacing between elements */
  align-items: center;
}

.points-text {
  font-size: 0.9rem;
  color: #666; /* Subtle color for the points text */
}
</style>