<script setup lang="ts">
import { ref, nextTick, computed } from 'vue';
import type { Component } from 'vue';
import { PhX } from '@phosphor-icons/vue';

const props = defineProps<{
  text: string,
  active: boolean,
  icon?: Component | null,
  variant?: 'solid' | 'translucent',
}>();



</script>

<template>
  <div class="tab-button-container">
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
  </div>
</template>

<style>
.tab-button-container {
  display: flex;
  align-items: center;
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