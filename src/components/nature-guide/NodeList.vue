<script setup lang="ts">
import { storeToRefs } from 'pinia';
import TreeNode from '@/components/nature-guide/TreeNode.vue';
import { useNatureGuideStore } from '@/stores/nature-guides';

const natureGuideStore = useNatureGuideStore();
const { natureGuide, currentStep } = storeToRefs(natureGuideStore); // Use storeToRefs to make currentStep reactive
</script>

<template>
  <div
    v-if="natureGuide && currentStep"
    class="nodelist"
  >
    <TreeNode
      v-for="node in currentStep.nodes"
      :key="node.uuid"
      :node="node"
    />
  </div>
</template>

<style scoped>
.nodelist {
  display: flex;
  flex-direction: column;
  gap: var(--size-md);
  width: 100%;
}

@media (min-width: 640px) {
}

@media (min-width: 768px) {
}

@media (min-width: 1024px) {
}

@media (min-width: 1280px) {
}

@media (min-width: 1536px) {
}
</style>