<script setup lang="ts">
import { computed, inject } from 'vue';
import type { Component } from 'vue';
import { storeToRefs } from 'pinia';
import { useRoute, useRouter } from 'vue-router';
import type { Navigations } from '@/types/navigation';
import { useMainNavigationStore } from '@/stores/main-navigation';
import { useTabsStore } from '@/stores/tabs';
import { useLetterSelectorStore } from '@/stores/letter-selector';
import { useModalsStore, MODAL_TYPES } from '@/stores/modals';
import MainNavigationButton from './MainNavigationButton.vue';
import TabsNavigation from './TabsNavigation.vue';
import MapHeader from '@/components/headers/MapHeader.vue';

import NavigationRailCTAButton from '../ui/NavigationRailCTAButton.vue';

const router = useRouter();
const route = useRoute();

const navigations = inject('navigations') as Navigations;
const mainNavigation = useMainNavigationStore();
const tabsStore = useTabsStore();
const letterSelectorStore = useLetterSelectorStore();
const modals = useModalsStore();

const { currentPageTitle } = storeToRefs(mainNavigation);

const headerTabNavigation = computed(() => tabsStore.getHeaderTabNavigation());

const hasHeaderTabs = computed(() => {
  return !!headerTabNavigation.value &&
    headerTabNavigation.value.showInMobileHeader &&
    headerTabNavigation.value.tabs.length > 1;
});

const headerTemplateRegistry: Record<string, Component> = {
  'map-header': MapHeader,
};

const headerTemplateComponent = computed<Component | null>(() => {
  if (typeof route.meta.headerTemplate !== 'string') return null;
  return headerTemplateRegistry[route.meta.headerTemplate] ?? null;
});

const headerTemplateProps = computed<Record<string, unknown>>(() => {
  const props = route.meta.headerTemplateProps;
  return props && typeof props === 'object' ? props : {};
});

const headerTitle = computed<string | null>(() => {
  if (typeof route.meta.headerTitle === 'string' && route.meta.headerTitle.length > 0) {
    return route.meta.headerTitle;
  }
  return currentPageTitle.value;
});

const resolvedHeaderMode = computed<'tabs' | 'title' | 'template' | 'none'>(() => {
  const headerMode = route.meta.headerMode ?? 'auto';

  if (headerMode === 'none') {
    return 'none';
  }

  if (headerMode === 'template') {
    if (headerTemplateComponent.value) return 'template';
    if (headerTitle.value) return 'title';
    if (hasHeaderTabs.value) return 'tabs';
    return 'none';
  }

  if (headerMode === 'tabs') {
    if (hasHeaderTabs.value) return 'tabs';
    if (headerTitle.value) return 'title';
    return 'none';
  }

  if (headerMode === 'title') {
    if (headerTitle.value) return 'title';
    if (hasHeaderTabs.value) return 'tabs';
    return 'none';
  }

  if (hasHeaderTabs.value) return 'tabs';
  if (headerTitle.value) return 'title';
  return 'none';
});

const hasHeaderContent = computed(() => resolvedHeaderMode.value !== 'none');

const handleSelectTab = (tabIndex: number) => {
  if (!tabsStore.headerTabNavigationId) return;
  tabsStore.setActiveTab(tabsStore.headerTabNavigationId, tabIndex);
};

const handleSelectLetter = (letter: string) => {
  if (!tabsStore.headerTabNavigationId) return;
  letterSelectorStore.setSelectedLetter(tabsStore.headerTabNavigationId, letter);
};

const handleUnselectLetter = () => {
  if (!tabsStore.headerTabNavigationId) return;
  letterSelectorStore.clearSelectedLetter(tabsStore.headerTabNavigationId);
};

const handleSearchText = (text: string) => {
  if (!tabsStore.headerTabNavigationId) return;
  tabsStore.setSearchText(tabsStore.headerTabNavigationId, text);
};
</script>

<template>
  <div id="NavigationRailLayout">
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

    <div v-if="hasHeaderContent" id="RailHeaderContent" class="bg-translucent-light backdrop-filter">
      <TabsNavigation
        v-if="resolvedHeaderMode === 'tabs' && headerTabNavigation"
        :tabs="headerTabNavigation.tabs"
        :active-tab="headerTabNavigation.activeTab ?? 1"
        :letter-selector-id="tabsStore.headerTabNavigationId ?? undefined"
        @select-tab="handleSelectTab"
        @select-letter="handleSelectLetter"
        @unselect-letter="handleUnselectLetter"
        @update:search-text="handleSearchText"
      />
      <component
        :is="headerTemplateComponent"
        v-else-if="resolvedHeaderMode === 'template' && headerTemplateComponent"
        v-bind="headerTemplateProps"
      />
      <div v-else-if="resolvedHeaderMode === 'title'" id="RailPageTitle">
        <span v-if="headerTitle" class="rail-header-title">
          {{ $t(headerTitle) }}
        </span>
      </div>
    </div>
  </div>
</template>

<style>
#NavigationRailLayout {
  display: none;
}

#NavigationRail {
  display: none;
  position: fixed;
  left: 0;
  top: 0;
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

#RailHeaderContent {
  display: none;
}

.rail-buttons {
  width: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--size-md);
}

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
  left: calc(var(--navigation-rail-width) + var(--size-md));
  transform-origin: 0% 50%;
}

.rail-buttons .navbutton-container.Stack .mn-stack .stack-button {
  height: 60px;
  aspect-ratio: 1/1;
}

@media (min-width: 640px) {
}

@media (min-width: 768px) {
  #NavigationRailLayout {
    display: block;
  }

  #NavigationRail {
    display: flex;
  }

  #RailHeaderContent {
    display: flex;
    position: fixed;
    top: 0;
    left: var(--navigation-rail-width);
    right: 0;
    width: calc(100vw - var(--navigation-rail-width));
    height: var(--tabs-navigation-height);
    align-items: center;
    justify-content: center;
    z-index: var(--layer-1);
    min-width: 0;
  }

  #RailHeaderContent > * {
    width: 100%;
  }

  #RailPageTitle {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding-left: var(--size-xl);
    padding-right: var(--size-xl);
  }

  .rail-header-title {
    display: inline-block;
    max-width: 100%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 20px;
    font-weight: bold;
    font-family: 'Inter Tight', sans-serif;
  }
}

@media (min-width: 1024px) {
}

@media (min-width: 1280px) {
  #NavigationRailLayout {
    display: none;
  }

  #NavigationRail {
    display: none;
  }

  #RailHeaderContent {
    display: none;
  }
}

@media (min-width: 1536px) {
}

@media (orientation: landscape) and (min-height: 400px) {
}
</style>
