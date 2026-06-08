<script setup lang="ts">
import { computed } from 'vue';
import type { Component } from 'vue';
import { storeToRefs } from 'pinia';
import { useRoute } from 'vue-router';
import { useMainNavigationStore } from '@/stores/main-navigation';
import { useTabsStore } from '@/stores/tabs';
import { useLetterSelectorStore } from '@/stores/letter-selector';

import TabsNavigation from './TabsNavigation.vue';
import MapHeader from '@/components/headers/MapHeader.vue';

const mainNavigation = useMainNavigationStore();
const tabsStore = useTabsStore();
const letterSelectorStore = useLetterSelectorStore();
const route = useRoute();

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
  const headerMode = route.meta.headerMode ?? 'none';

  // For the mobile HeaderBar, `auto` intentionally maps to no header.
  if (headerMode === 'none' || headerMode === 'auto') {
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
  <nav v-if="hasHeaderContent" id="HeaderBar">
    <div
      id="header-left"
      :class="{
        'bg-translucent-light': hasHeaderContent,
        'backdrop-filter': hasHeaderContent,
      }"
    >
      &nbsp;
    </div>
    <div id="header-middle">
      <div id="header-middle-content">
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
        <div
          v-else-if="resolvedHeaderMode === 'title'"
          id="PageTitle"
          :class="{'bg-translucent-light': headerTitle, 'backdrop-filter': headerTitle}"
        >
          <span v-if="headerTitle" class="header-bar-title">
            {{ $t(headerTitle) }}
          </span>
        </div>
        
      </div>
    </div>
  </nav>
</template>

<style>
#HeaderBar {
  height: var(--header-bar-height);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  width: 100%;
  display: grid;
  grid-template-columns: var(--header-bar-height) auto;
  z-index: var(--layer-1);
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden; /* Safari/iOS */
}

#header-right, #header-left {
  display: flex;
  flex-direction: row;
  align-items: center;
  height: 100%;
  aspect-ratio: 1/1;
}

#header-left.slim-burger {
  background: var(--color-white-translucent-light);
  backdrop-filter: var(--backdrop-filter-blur);
  border-radius: 0 25px 25px 0;
  box-shadow: 0px 0px 4px rgba(0, 0, 0, 0.2);
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
  min-width: 0;
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
  min-width: 0;
}

#PageTitle {
  width:100%;
  height: 100%;
  padding-right: var(--header-bar-height);
  display: flex;
  align-items: center;
  justify-content: center;
}

.top-logo-container {
  display: flex;
  height: 100%;
  padding: var(--header-bar-padding);
}

.top-logo {
  height: calc(var(--header-bar-height) - (var(--header-bar-padding) * 2))
}


.header-bar-title {
  display: inline-block;
  max-width: calc(100vw - (var(--header-bar-height) * 2));
  max-width: calc(100dvw - (var(--header-bar-height) * 2));
  white-space: nowrap; 
  overflow: hidden;
  text-overflow: ellipsis;
  font-family: --var(font-family-tight);
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
  #PageTitle {
    display: none;
  }
}

@media (min-width: 1536px) {
}

</style>