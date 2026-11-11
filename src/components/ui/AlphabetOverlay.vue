<script setup lang="ts">
import { useLetterSelectorStore } from "@/stores/letter-selector";
import LetterSelector from "@/components/ui/LetterSelector.vue";

const store = useLetterSelectorStore();

const selectLetter = (letter: string) => {
  if (store.overlay.selectorId) {
    store.setSelectedLetter(store.overlay.selectorId, letter);
  }
};

const unselectLetter = () => {
  if (store.overlay.selectorId) {
    store.clearSelectedLetter(store.overlay.selectorId);
  }
};
</script>

<template>
  <div v-if="store.overlay.active" class="alphabet-overlay">
    <div>
      <div class="letter-container page-padding-x backdrop-filter">
        <LetterSelector
          :id="store.overlay.selectorId ?? 'tab-alphabet'"
          :slim="true"
          :letters="store.overlay.letters"
          :initial-letter="store.overlay.initialLetter"
          @select="selectLetter"
          @unselect="unselectLetter"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
@layer defaults {
  :root {
    --alphabet-letters-background: var(--bg-translucent-light);
    --letter-container-background: none;

    --darkmode-alphabet-letters-background: var(--bg-translucent-2-light);
    --darkmode-letter-container-background: rgba(255, 255, 255, 0.8);
  }
}
/* Full-width overlay positioned relative to viewport */
.alphabet-overlay {
  position: fixed;
  top: calc(var(--header-bar-height));
  left: 0;
  right: 0;
  z-index: var(--layer-2);
  background-color: var(--alphabet-letters-background);
}

body.dark .alphabet-overlay {
  background-color: var(--darkmode-alphabet-letters-background);
}

.letter-container {
  background-color: var(--letter-container-background);
}

body.dark .letter-container {
  background-color: var(--darkmode-letter-container-background);
}

body.dark .alphabet-overlay {
  background-color: var(--darkmode-alphabet-letters-background);
}

@media (min-width: 640px) {
}

@media (min-width: 768px) {
  .alphabet-overlay {
    top: var(--tabs-navigation-height);
    left: var(--navigation-rail-width);
    right: 0;
  }
}

@media (min-width: 1024px) {
}

@media (min-width: 1280px) {
  .alphabet-overlay {
    top: calc(var(--desktop-header-bar-height) + var(--desktop-tabs-navigation-height));
    left: 0;
  }

  .alphabet-overlay > div {
    width: 1280px;
    margin: 0 auto;
  }
}

@media (min-width: 1536px) {
}
</style>
