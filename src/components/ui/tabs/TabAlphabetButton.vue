<script setup lang="ts">
import type { Component } from "vue";
import { watch, onUnmounted } from "vue";
import { useLetterSelectorStore } from "@/stores/letter-selector";

const props = defineProps<{
  text: string,
  active: boolean,
  letters: string[] | [],
  letterSelectorId?: string,
  icon?: Component | null,
  noResults?: boolean
  variant?: 'solid' | 'translucent',
}>();

const letterSelectorStore = useLetterSelectorStore();
const resolvedSelectorId = props.letterSelectorId ?? "tab-alphabet";
const initialLetter = props.letters.length > 0 ? props.letters[0] : null;

watch(
  () => props.active,
  (active) => {
    if (active) {
      letterSelectorStore.showOverlay(resolvedSelectorId, props.letters, initialLetter);
    } else {
      letterSelectorStore.hideOverlay();
    }
  },
  { immediate: true },
);

onUnmounted(() => {
  if (props.active) {
    letterSelectorStore.hideOverlay();
  }
});
</script>

<template>
  <div class="tab-button-container azbutton">
    <div
      class="tab-button"
      :class="{
        active: active,
        [`style-${variant ?? 'solid'}`]: true,
      }"
    >
      <div v-if="icon" class="tab-icon">
        <component :is="icon" :size="12" />
      </div>
      <div class="tab-text">
        {{ text }}
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>
