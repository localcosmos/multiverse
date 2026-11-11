<script setup lang="ts">
import type { Component } from 'vue';

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

<style>
@layer defaults {
  :root {
    --tab-button-bg-solid: #FFF;
    --tab-button-color-solid: #000;

    --tab-button-active-bg-solid: var(--tab-button-bg-solid);
    --tab-button-active-color-solid: var(--tab-button-color-solid);

    --tab-button-bg-translucent: rgba(255, 255, 255, 0.7);
    --tab-button-color-translucent: #000;

    --tab-button-active-bg-translucent: var(--tab-button-bg-translucent);
    --tab-button-active-color-translucent: var(--tab-button-color-translucent);

    --darkmode-tab-button-bg-solid: #000;
    --darkmode-tab-button-color-solid: #FFF;
    --darkmode-tab-button-bg-translucent: rgba(0, 0, 0, 0.7);
    --darkmode-tab-button-color-translucent: #FFF;
    --darkmode-tab-button-active-bg-solid: var(--darkmode-tab-button-bg-solid);
    --darkmode-tab-button-active-color-solid: var(--darkmode-tab-button-color-solid);
    --darkmode-tab-button-active-bg-translucent: var(--darkmode-tab-button-bg-translucent);
    --darkmode-tab-button-active-color-translucent: var(--darkmode-tab-button-color-translucent);
  }
}

.tab-button-container {
  display: flex;
  align-items: center;
}

.tab-button {
  border-radius: 5em;
  padding: 8px 16px;
  font-size: 12px;
  font-family: var(--font-family-tight);
  transition: var(--transition-cubic);
  transform-origin: center center;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 2px;
  cursor: pointer;
}

.tab-button.style-translucent {
  background: var(--tab-button-bg-translucent);
  color: var(--tab-button-color-translucent);
  opacity: 0.7;
}

body.dark .tab-button.style-translucent {
  background: var(--darkmode-tab-button-bg-translucent);
  color: var(--darkmode-tab-button-color-translucent);
  opacity: 0.7;
}

.tab-button.style-solid {
  background: var(--tab-button-bg-solid);
  color: var(--tab-button-color-solid);
}

.tab-button.style-solid.active {
  color: var(--tab-button-active-color-solid);
  background: var(--tab-button-active-bg-solid);
}

.tab-button.style-translucent.active {
  color: var(--tab-button-active-color-translucent);
  background: var(--tab-button-active-bg-translucent);
  opacity: 1;
}

body.dark .tab-button.style-solid.active {
  color: var(--darkmode-tab-button-active-color-solid);
  background: var(--darkmode-tab-button-active-bg-solid);
}

body.dark .tab-button.style-translucent.active {
  color: var(--darkmode-tab-button-active-color-translucent);
  background: var(--darkmode-tab-button-active-bg-translucent);
  opacity: 1;
}

body.dark .tab-button.style-solid {
  background: var(--darkmode-tab-button-bg-solid);
  color: var(--darkmode-tab-button-color-solid);
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
