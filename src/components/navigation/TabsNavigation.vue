<script setup lang="ts">
import type { TabButtonDefinition } from '@/types/navigation';

import TabButton from '../ui/tabs/TabButton.vue';
import TabSearchButton from '../ui/tabs/TabSearchButton.vue';
import TabAlphabetButton from '../ui/tabs/TabAlphabetButton.vue';

withDefaults(
  defineProps<{
    tabs: TabButtonDefinition[];
    activeTab: number;
    letterSelectorId?: string;
  }>(),
  {
    activeTab: 1,
    letterSelectorId: 'tab-alphabet',
  }
);

const emit = defineEmits<{
  (e: 'select-tab', value: number): void;
  (e: 'update:search-text', value: string): void;
  (e: 'select-letter', value: string): void;
  (e: 'unselect-letter'): void;
}>();

// Function to handle search text emitted by TabButton
const handleSearchText = (text: string) => {
  emit('update:search-text', text);
};

const handleSelectLetter = (letter: string) => {
  emit('select-letter', letter);
};

const handleUnselectLetter = () => {
  emit('unselect-letter');
};


</script>

<template>
  <div
    v-if="tabs.length > 1"
    class="tabs-navigation backdrop-filter"
  >
    <div>
      <!-- select button component-->
      <component
        v-for="(button, counter) in tabs"
        :is="button.type === 'search' ? TabSearchButton : button.type === 'alphabet' ? TabAlphabetButton : TabButton"
        :key="counter"
        :text="button.text"
        :icon="button.icon ? button.icon : null"
        class="cursor-pointer"
        :active="button.tabIndex === activeTab"
        :letters="button.letters ? button.letters : []"
        :letter-selector-id="letterSelectorId"
        @click="emit('select-tab', button.tabIndex)"
        v-on="{ ...(button.type === 'alphabet' ? { 'select-letter': handleSelectLetter, 'unselect-letter': handleUnselectLetter } : {}), ...(button.type === 'search' ? { 'update:search-text': handleSearchText } : {}) }"
      />
    </div>
  </div>
</template>

<style scoped>
.tabs-navigation {
  display: flex;
  flex-wrap:nowrap;
  justify-content: flex-start;
  align-items: center;
  min-width: 100%;
  height: 100%;
  -ms-overflow-style: none;
  scrollbar-width: none;
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
  z-index: var(--layer-1);
  background-color: var(--color-white-translucent-light);
}

.tabs-navigation::-webkit-scrollbar {
  display: none;
}

.tabs-navigation > div {
  display: flex;
  flex-wrap: nowrap;
  flex-direction: row;
  gap: var(--gap-medium);
  width: max-content;
  min-width: 100%;
  align-items: center;
}

.tabs-navigation > div > * {
  flex: 0 0 auto;
}

.tabs-navigation > div > *:last-child {
  padding-right: var(--gap-medium);
}

@media (min-width: 640px) {
}

@media (min-width: 768px) {
}

@media (min-width: 1024px) {
}

@media (min-width: 1280px) {
  .tabs-navigation > div {
    justify-content: center;
  }

  .tabs-navigation {
    background-color: var(--color-white-translucent);
  }
}

@media (min-width: 1536px) {
}
</style>