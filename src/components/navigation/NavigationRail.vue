<script setup lang="ts">
import { inject } from 'vue';
import { useRouter } from 'vue-router';
import type { Navigations } from '@/types/navigation';
import { useMainNavigationStore } from '@/stores/main-navigation';
import { useModalsStore, MODAL_TYPES } from '@/stores/modals';
import MainNavigationButton from './MainNavigationButton.vue';

import NavigationRailCTAButton from '../ui/NavigationRailCTAButton.vue';

const router = useRouter();

const navigations = inject('navigations') as Navigations;
const mainNavigation = useMainNavigationStore();
const modals = useModalsStore();

</script>

<template>
  <nav
    id="NavigationRail"
    class="bg-translucent-light backdrop-filter"
  >
    <div id="NavigationRailTop">
      <div
        v-if="mainNavigation.showBackbutton"
        id="RailBackButton"
        class="cursor-pointer"
        @click="router.back()"
      >
        <img src="@/assets/icons/back.svg" />
      </div>
      <div
        v-else
        id="RailBurger"
        class="cursor-pointer"
        @click="modals.openModal(MODAL_TYPES.BURGER)"
      >
        <div>
          <img src="@/assets/icons/menubars.svg" />
        </div>
        
      </div>
    </div>
    <div class="rail-buttons">
      <NavigationRailCTAButton v-if="mainNavigation.observationCTA"></NavigationRailCTAButton>
      <MainNavigationButton
        v-for="(button, index) in navigations.rail"
        :key="index"
        :button="button"
        :button-index="index"
        navigation="rail"
      >
      </MainNavigationButton>
    </div>
  </nav>
</template>

<style>
#NavigationRail {
  display: none;
  position: fixed;
  left: 0;
  z-index: var(--layer-1);
  height: 100vh;
  height: 100dvh;
  width: var(--navigation-rail-width);
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
}

#NavigationRailTop {
  width: 100%;
  aspect-ratio: 1/1;
}

.rail-buttons {
  width: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--size-md);
}

/*
.rail-buttons .Home, .rail-buttons .Glossary { 
  display: none;
}*/

#RailBurger, #RailBackButton {
  width: 100%;
  aspect-ratio: 1/1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.rail-buttons .navbutton-container.Stack .mn-stack {
  flex-direction: row;
  bottom: -10px;
  right: auto;
  left: calc( var(--navigation-rail-width) + var(--size-md) );
  transform-origin: 0% 50%;
}

.rail-buttons .navbutton-container.Stack .mn-stack .stack-button {
  height: 60px;
  aspect-ratio: 1/1;
}

@media (min-width: 640px) {
}

@media (min-width: 768px) {
  #NavigationRail {
    display: flex;
  }
}

@media (min-width: 1024px) {

}

@media (min-width: 1280px) {
  #NavigationRail {
    display: none;
  }
}

@media (min-width: 1536px) {
}

@media (orientation: landscape) and (min-height: 400px){
}
</style>