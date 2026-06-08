<script setup lang="ts">
import type { Component } from 'vue';
import LetterSelector from '@/components/ui/LetterSelector.vue';

const props = defineProps<{
  text: string,
  active: boolean,
  letters: string[] | [],
  letterSelectorId?: string,
  icon?: Component | null,
  noResults?: boolean
  variant?: 'solid' | 'translucent',
}>();


const initialLetter = props.letters.length > 0 ? props.letters[0] : null;

// emit the selected letter
const emit = defineEmits<{
  (e: 'select-letter', value: string): void; // Emit event for selected letter
  (e: 'unselect-letter', value: string): void; // Emit event for unselected letter
}>();


const selectLetter = (letter: string) => {
  emit('select-letter', letter);
};

const unselectLetter = () => {
  emit('unselect-letter', '');
};
</script>

<template>
  <div class="tab-button-container azbutton">
    <!-- Search Button -->
    <div
      class="tab-button"
      :class="{
        'active': active,
        'bg-translucent-light': !variant, // Only apply default background if no style
        [`style-${variant}`]: variant
      }"
    >
      <div v-if="icon" class="tab-icon">
        <component :is="icon" :size="12" />
      </div>
      <div class="tab-text">
        {{ text }}
      </div>
    </div>
    <!-- Render overlay outside transformed parents -->
    <teleport to="body">
      <div
        v-show="active"
        class="alphabet-overlay"
      >
        <div>
          <div class="letter-container page-padding-x backdrop-filter">
            <LetterSelector
              :id="letterSelectorId ?? 'tab-alphabet'"
              :slim="true"
              :letters="letters"
              :initial-letter="initialLetter"
              @select="selectLetter"
              @unselect="unselectLetter"
            />
          </div>
        </div>
      </div>
    </teleport>
  </div>
</template>

<style scoped>
/* Full-width overlay positioned relative to viewport */
.alphabet-overlay {
  position: fixed;
  top: calc(var(--header-bar-height));
  left: 0;
  right: 0;
  z-index: var(--layer-2);
}

.letter-container {
  padding-top: var(--size-sm);
  padding-bottom: var(--size-sm);
  background-color: var(--color-white-translucent-light);
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