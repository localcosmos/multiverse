<script setup lang="ts">
import { ref, nextTick, computed } from 'vue';
import type { Component } from 'vue';
import { PhX } from '@phosphor-icons/vue';

const props = defineProps<{
  text: string,
  active: boolean,
  icon?: Component | null,
  searchMode?: boolean,
  noResults?: boolean
  variant?: 'solid' | 'translucent',
}>();

const emit = defineEmits<{
  (e: 'update:searchText', value: string): void; // Emit event for search text
}>();

// Reactive state to toggle between button and input field
const isSearching = ref<boolean>(false);
const hasInteracted = ref<boolean>(false); // Tracks if the user has interacted with the input
const searchInputRef = ref<HTMLInputElement | null>(null); // Reference to the input field
const searchText = ref<string>(''); // Reactive state for the search text

// Function to toggle the search state
const toggleSearch = async () => {
  if (props.searchMode) {
    isSearching.value = !isSearching.value;
    hasInteracted.value = false; // Reset interaction state when toggling

    // Focus the input field after it is rendered
    if (isSearching.value) {
      await nextTick(); // Wait for the DOM to update
      searchInputRef.value?.focus();
    }
  }
};

// Function to handle blur event
const handleBlur = () => {
  if (!hasInteracted.value || searchText.value === '') {
    isSearching.value = false; // Only close if no interaction occurred
  }
};

// Function to track user interaction
const handleInteraction = (event: Event) => {
  hasInteracted.value = true; // Mark as interacted when typing or clicking
  const target = event.target as HTMLInputElement;
  searchText.value = target.value; // Update the search text
  emit('update:searchText', searchText.value); // Emit the updated search text
};

// Function to clear the input field
const clearSearch = () => {
  searchText.value = ''; // Clear the search text
  emit('update:searchText', ''); // Emit an empty search text
  searchInputRef.value?.focus(); // Refocus the input field
};

// Computed class for input error
const searchInputClass = computed(() =>
  props.noResults ? 'search-input error' : 'search-input'
);
</script>

<template>
  <div
    class="tab-button-container"
    :class="searchMode === true ? 'search-mode' : ''"
  >
    <!-- Search Button -->
    <div
      v-if="!isSearching"
      class="tab-button"
      :class="{
        'active': active,
        'bg-translucent-light': !variant, // Only apply default background if no style
        [`style-${variant}`]: variant
      }"
      @click="toggleSearch"
    >
      <div v-if="icon" class="tab-icon">
        <component :is="icon" :size="12" />
      </div>
      <div class="tab-text">
        {{ text }}
      </div>
    </div>

    <!-- Search Input Field -->
    <div v-else class="tab-input">
      <input
        type="text"
        :class="searchInputClass"
        placeholder="Search..."
        v-model="searchText"
        @input="handleInteraction"
        @blur="handleBlur"
        ref="searchInputRef"
      />
      <!-- Clear Icon -->
      <div
        v-if="searchText"
        class="clear-icon"
        @click="clearSearch"
      >
        <PhX :size="16" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.tab-button-container {
  display: flex;
  align-items: center;
}

.tab-button-container.search-mode {
  flex-grow: 1;
}

.tab-button {
  border-radius: 5em;
  padding: 8px 16px;
  font-size: 12px;
  font-family: 'UbuntuCondensed';
  transition: var(--transition-cubic);
  transform-origin: center center;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 2px;
  cursor: pointer;
}

.tab-button.style-solid {
  background: #FFF;
}

.tab-button.active {
  color: var(--color-white);
  background: var(--color-black-translucent);
}

body.dark .tab-button.active {
  color: var(--color-black);
  background: var(--color-white-translucent);
}

.tab-icon {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}

.tab-input {
  display: flex;
  align-items: center;
  width: 100%;
  position: relative;
}

.search-input {
  width: 100%;
  flex-grow: 1;
  padding: 8px 16px;
  font-size: 12px;
  font-family: 'UbuntuCondensed';
  border: 1px solid var(--color-black-translucent);
  border-radius: 5em;
  outline: none;
  transition: var(--transition-cubic);
  height: 31px;
  padding-right: 32px; /* Add space for the clear icon */
}

.search-input.error {
  border-color: #e53935;
  background: #fff0f0;
}

.clear-icon {
  position: absolute;
  right: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-black-translucent);
  transition: color 0.2s;
}

.clear-icon:hover {
  color: var(--color-black);
}

@media (min-width: 640px) {
}

@media (min-width: 768px) {
}

@media (min-width: 1024px) {
  .tab-button {
    font-size: 16px;
  }

  
}

@media (min-width: 1280px) {
}

@media (min-width: 1536px) {
}
</style>