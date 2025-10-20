<script setup lang="ts">
import { inject } from 'vue';
import type { Navigations } from '@/types/navigation';
import MainNavigationButton from './MainNavigationButton.vue';

const navigations = inject('navigations') as Navigations;

</script>

<template>
  <nav
    id="BottomNavigation"
    class="bg-translucent-medium backdrop-filter"
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

<style scoped>
#BottomNavigation {
  position: fixed;
  z-index: var(--layer-1);
  height: var(--bottom-navigation-height);
  bottom: var(--bottom-navigation-offset-bottom);
  left: var(--size-md); right: var(--size-md);
  border-radius: var(--border-radius);
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
