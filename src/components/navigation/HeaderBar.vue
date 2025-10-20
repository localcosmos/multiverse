<script setup lang="ts">
import { ref, inject } from 'vue';
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';
import { useModalsStore, MODAL_TYPES } from '@/stores/modals';
import { useMainNavigationStore } from '@/stores/main-navigation';
import type { Navigations } from '@/types/navigation';

import MainNavigationButton from './MainNavigationButton.vue';

const navigations = inject('navigations') as Navigations;
const mainNavigation = useMainNavigationStore();
const modals = useModalsStore();
const router = useRouter();

const { currentPageTitle } = storeToRefs(mainNavigation);

const logoSrc = ref<string>('/images/logos/LocalCosmos.svg');

</script>

<template>
  <nav
    id="HeaderBar"
    class="bg-translucent-medium backdrop-filter"
  >
    <div id="header-left">
      <div
        v-if="mainNavigation.showBackbutton"
        class="cursor-pointer"
        @click="router.back()"
      >
        <img src="@/assets/icons/back.svg" />
      </div>
      <div
        v-if="mainNavigation.showBurger"
        class="cursor-pointer"
        @click="modals.openModal(MODAL_TYPES.BURGER)"
      >
        <img src="@/assets/icons/menubars.svg" />
      </div>
    </div>
    <div id="header-middle">
      <div id="header-middle-content">
        <div id="PageTitle">
          <span  v-if="currentPageTitle" class="header-bar-title">
            {{ $t(currentPageTitle) }}
          </span>
        </div>
        <nav id="DesktopNavigation">
          <MainNavigationButton
            v-for="(button, index) in navigations.main"
            :key="index"
            :button="button"
            :button-index="index"
            navigation="desktop"
          >
          </MainNavigationButton>
        </nav>
        <!--<router-link :to="{ name: 'home' }" class="top-logo-container">
          <img :src="logoSrc" class="top-logo" />
        </router-link>-->
      </div>
    </div>
    <div
      id="header-right"
    >
    </div>
  </nav>
</template>

<style>
#HeaderBar {
  height: var(--header-bar-height);
  position: fixed;
  top: 0;
  width: 100vw;
  display: grid;
  grid-template-columns: var(--header-bar-height) auto var(--header-bar-height);
  z-index: var(--layer-1);
}

#header-right, #header-left {
  display: flex;
  flex-direction: row;
  align-items: center;
  height: 100%;
  aspect-ratio: 1/1;
}

#header-right {
  justify-content: flex-end;
  padding: var(--header-bar-padding);
}

#header-left {
  justify-content: flex-start;
}

#header-left > div {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: var(--header-bar-padding);
}

#header-middle {
  display: flex;
  justify-content: center;
  align-items: center;
}

#header-middle-content {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  font-size: 20px;
  font-weight: bold;
}

.top-logo-container {
  display: flex;
  height: 100%;
  padding: var(--header-bar-padding);
}

.top-logo {
  height: calc(var(--header-bar-height) - (var(--header-bar-padding) * 2))
}

#DesktopNavigation {
  display: none;
}

#DesktopNavigation, #DesktopNavigation .Stack {
  display: none;
}

.header-bar-title {
  display: inline-block;
  max-width: calc(100vw - (var(--header-bar-height) * 2));
  max-width: calc(100dvw - (var(--header-bar-height) * 2));
  white-space: nowrap; 
  overflow: hidden;
  text-overflow: ellipsis;
}

@media (min-width: 640px) {
}

@media (min-width: 768px) {
  #HeaderBar {
    display: none;
  }
}

@media (min-width: 1024px) {

}

@media (min-width: 1280px) {
  #HeaderBar {
    display: grid;
    height: var(--desktop-header-bar-height);
  }

  #PageTitle {
    display: none;
  }

  #DesktopNavigation {
    display: flex;
    flex-direction: row;
    gap: 28px;
  }

  #header-middle-content {
    justify-content: center;

  }
}

@media (min-width: 1536px) {
}

</style>