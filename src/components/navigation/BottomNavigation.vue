<script setup lang="ts">
import { inject } from 'vue';
import type { Navigations } from '@/types/navigation';
import MainNavigationButton from './MainNavigationButton.vue';

const navigations = inject('navigations') as Navigations;

</script>

<template>
  <nav
    id="BottomNavigation"
    class="backdrop-filter"
  >
    <div>
        <MainNavigationButton
          v-for="(button, index) in navigations.bottom"
          :key="index"
          :button="button"
          :button-index="index"
          navigation="bottom"
        >
        </MainNavigationButton>
    </div>
  </nav>
</template>

<style>
@layer defaults {
  :root {
    --bottom-navigation-height: 64px;
    --bottom-navigation-offset-bottom: 7px;
    --bottom-navigation-border-radius: var(--border-radius);
    --bottom-navigation-left: var(--size-xs);
    --bottom-navigation-right: var(--size-xs);
    --bottom-navigation-bg: rgba(255, 255, 255, 0.7);

    --darkmode-bottom-navigation-bg: rgba(0, 0, 0, 0.7);
  }
}

#BottomNavigation {
  position: fixed;
  z-index: var(--layer-1);
  height: var(--bottom-navigation-height);
  bottom: max(var(--bottom-navigation-offset-bottom), env(safe-area-inset-bottom, 0px));
  left: var(--bottom-navigation-left); right: var(--bottom-navigation-right);
  border-radius: var(--bottom-navigation-border-radius);
  background: var(--bottom-navigation-bg);
}

#BottomNavigation > div {
  width: 100%;
  height: 100%;
  position: relative; /* required for submenus to work */
  display: flex;
  justify-content: center;
  align-items: center;
}

/* breakpoints */
@media (min-width: 640px) {
}

@media (min-width: 768px) {
  #BottomNavigation {
    display: none;
  }
}

@media (min-width: 1024px) {

}

@media (min-width: 1280px) {
}

@media (min-width: 1536px) {
}

</style>
