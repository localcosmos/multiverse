<script setup lang="ts">
import { computed, inject } from 'vue';
import type { Component } from 'vue';
import type { Frontend } from 'localcosmos-client';
import { storeToRefs } from 'pinia';
import { useRoute } from 'vue-router';
import { useMainNavigationStore } from '@/stores/main-navigation';
import { useTabsStore } from '@/stores/tabs';
import { useLetterSelectorStore } from '@/stores/letter-selector';
import { useExhibitionModeStore } from '@/stores/exhibition-mode';
import MainNavigationButton from './MainNavigationButton.vue';
import TabsNavigation from './TabsNavigation.vue';
import MapHeader from '@/components/headers/MapHeader.vue';
import type { Navigations } from '@/types/navigation';
import LogoWithText from '@/components/ui/LogoWithText.vue';

const navigations = inject('navigations') as Navigations;
const mainNavigation = useMainNavigationStore();
const tabsStore = useTabsStore();
const letterSelectorStore = useLetterSelectorStore();
const exhibitionMode = useExhibitionModeStore();
const route = useRoute();

const frontend = inject("frontend") as Frontend;

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
  <div id="DesktopHeaderBar">
    <nav v-if="!exhibitionMode.isActive" id="DesktopNavigation">
      <div class="DesktopNavigation__content container">
        <RouterLink
          v-if="frontend.userContent?.images?.logoWithText?.imageUrl"
          class="DesktopNavigation__logo"
          :to="{ name:'home' }"
        >
          <LogoWithText />
        </RouterLink>
        <MainNavigationButton
          v-for="(button, index) in navigations.main"
          :key="index"
          :button="button"
          :button-index="index"
          navigation="desktop"
        >
        </MainNavigationButton>
      </div>
    </nav>
    <div
      v-if="hasHeaderContent"
      id="DesktopHeaderContent"
    >
      <div id="DesktopHeaderContentInner">
        <TabsNavigation
          v-if="resolvedHeaderMode === 'tabs' && headerTabNavigation"
          :tabs="headerTabNavigation.tabs"
          :active-tab="headerTabNavigation.activeTab ?? 1"
          :search-text="headerTabNavigation.searchText ?? ''"
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
        <!--
        <div v-else-if="resolvedHeaderMode === 'title'" id="DesktopPageTitle">
          <span v-if="headerTitle" class="desktop-header-title">
            {{ $t(headerTitle) }}
          </span>
        </div>
      -->
      </div>
    </div>
  </div>
</template>

<style>
@layer defaults {
  :root {
    --desktop-navigation-bg: rgba(255,255,255, 0.8);
    --desktop-navigation-backgdrop-filter: blur(10px);

    --darkmode-desktop-navigation-bg: rgba(0, 0, 0, 0.8);
  }
}

#DesktopHeaderBar {
  display: none;
}

#DesktopNavigation {
  display: none;
  background: var(--desktop-navigation-bg);
  backdrop-filter: var(--desktop-navigation-backgdrop-filter);
}

body.dark #DesktopNavigation {
  background: var(--darkmode-desktop-navigation-bg);
}

.DesktopNavigation__logo {
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  left: var(--size-xl);
}

.DesktopNavigation__logo img {
  height: 40px;
  width: auto;
}

.DesktopNavigation__content {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  position: relative;
}

#DesktopHeaderContent {
  display: none;
}

#DesktopNavigation, #DesktopNavigation .Stack {
  display: none;
}

@media (min-width: 1280px) {

  #DesktopHeaderBar {
    display: block;
  }

  #DesktopNavigation {
    height: var(--desktop-header-bar-height);
    display: flex;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    width: 100%;
    justify-content: center;
    align-items: center;
    flex-direction: row;
    gap: var(--gap-medium);
    z-index: var(--layer-1);
  }

  #DesktopHeaderContent {
    height: var(--desktop-tabs-navigation-height);
    display: flex;
    position: fixed;
    top: var(--desktop-header-bar-height);
    left: 0;
    right: 0;
    width: 100%;
    justify-content: center;
    align-items: center;
    z-index: var(--layer-1);
  }

  body.exhibition-mode #DesktopHeaderContent {
    top: 0;
  }

  #DesktopHeaderContentInner {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 0;
  }

  #DesktopPageTitle {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding-left: var(--size-xl);
    padding-right: var(--size-xl);
  }

  .desktop-header-title {
    display: inline-block;
    max-width: 100%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 20px;
    font-weight: bold;
    font-family: var(--font-family-tight);
  }

}

</style>
