<script setup lang="ts">
import { computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue';
import { useTabsStore } from '@/stores/tabs';
import type { TabButtonDefinition } from '@/types/navigation';


const props = withDefaults(
  defineProps<{
    id: string;
    tabs: TabButtonDefinition[];
    initialTab?: number;
    explodeOnLargeScreens?: boolean;
    showNavOnLargeScreens?: boolean;
    showInMobileHeader?: boolean;
  }>(),
  {
    explodeOnLargeScreens: false,
    showNavOnLargeScreens: false,
    showInMobileHeader: true,
    initialTab: 1,
  }
);

const tabsStore = useTabsStore();
let intersectionObserver: IntersectionObserver | null = null;

tabsStore.registerTabNavigation(props.id, {
  tabs: props.tabs,
  initialTab: props.initialTab,
  showInMobileHeader: props.showInMobileHeader,
});

if (props.showInMobileHeader && props.tabs.length > 1) {
  tabsStore.setHeaderTabNavigation(props.id);
}

// Single source of truth: store drives activeTab, no local ref needed
const activeTab = computed({
  get: () => tabsStore.tabs[props.id]?.activeTab ?? props.initialTab,
  set: (value: number) => tabsStore.setActiveTab(props.id, value),
});

watch(
  () => props.tabs,
  (newTabs) => {
    tabsStore.setTabDefinitions(props.id, newTabs);
    
    // If tabs were previously empty and now have content, set header navigation
    if (props.showInMobileHeader && newTabs.length > 1) {
      tabsStore.setHeaderTabNavigation(props.id);
    }
  },
  { deep: true }
);

watch(
  () => props.showInMobileHeader,
  (showInMobileHeader) => {
    tabsStore.setShowInMobileHeader(props.id, showInMobileHeader);

    if (showInMobileHeader && props.tabs.length > 1) {
      tabsStore.setHeaderTabNavigation(props.id);
      return;
    }

    if (tabsStore.headerTabNavigationId === props.id) {
      tabsStore.clearHeaderTabNavigation();
    }
  }
);

// Check if we're in exploded mode on large screens
const isExplodedMode = () => {
  return props.explodeOnLargeScreens && window.innerWidth >= 1024;
};

/*
const activateTab = (tabIndex: number) => {

  activeTab.value = tabIndex;
  
  // In exploded mode, scroll to the tab instead of switching
  if (isExplodedMode()) {
    const tabNumber = props.tabs[tabIndex].tabIndex;
    scrollToTab(tabNumber);
  } else {
    // Scroll to the top of the tabs navigation to keep it visible at the top
    setTimeout(() => {
      const pageHeader = document.getElementById('HeaderBar') as HTMLElement;
      const tabNav = document.getElementById('tabs-navigation') as HTMLElement;
      const tabId = `${props.id}-tab${tabIndex}`;

      const activeTabElement = document.getElementById(tabId) as HTMLElement;

      if (pageHeader && tabNav && activeTabElement) {
        const topValue = pageHeader.offsetHeight + tabNav.offsetHeight;

        const navTop = tabNav.getBoundingClientRect().top;

        const tabElementTop = activeTabElement.getBoundingClientRect().top;

        // only scroll if the tabNav is lower on the screen than pageHeader.offsetHeight
        // only scroll if the heading is not already fully visible
        if (navTop > pageHeader.offsetHeight || tabElementTop > topValue) {
          return;
        }

        const scrollTo = window.scrollY + tabElementTop - topValue;
        // make it smooth
        window.scrollTo({ top: scrollTo, behavior: 'smooth' });
      }

    }, 100);
  }
};
*/

// Set up intersection observer to update active tab based on scroll position in exploded mode
onMounted(() => {

  // check the active tab
  console.log('Mounted TabbedPage, activeTab:', activeTab.value);

  if (props.explodeOnLargeScreens) {
    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -70% 0px', // Trigger when tab is in the middle portion of viewport
      threshold: 0
    };

    intersectionObserver = new IntersectionObserver((entries) => {
      if (!isExplodedMode()) return;
      
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const tabId = entry.target.id;
          const tabMatch = tabId.match(/tab(\d+)$/);
          if (tabMatch) {
            const tabNumber = parseInt(tabMatch[1]);
            if (tabNumber !== activeTab.value) {
              activeTab.value = tabNumber;
            }
          }
        }
      });
    }, observerOptions);

    // Observe all tab elements
    nextTick(() => {
      props.tabs.forEach((button) => {
        const tabElement = document.getElementById(`${props.id}-tab${button.tabIndex}`);
        if (tabElement) {
          intersectionObserver?.observe(tabElement);
        }
      });
    });
  }
});

onBeforeUnmount(() => {
  intersectionObserver?.disconnect();
  intersectionObserver = null;

  if (tabsStore.headerTabNavigationId === props.id) {
    tabsStore.clearHeaderTabNavigation();
  }
});
</script>

<template>
  <div :class="[
    explodeOnLargeScreens === true ? 'explode' : '',
    showNavOnLargeScreens === true ? 'show-nav-large' : ''
  ]">
    <div class="tabs">
      <div
        v-for="(button, index) in tabs"
        :key="index"
        :id="`${id}-tab${button.tabIndex}`"
        :class="['tab', `tab${button.tabIndex}`, { active: activeTab === button.tabIndex}]"
      >
        <slot :name="'tab' + (button.tabIndex)"></slot>
      </div>
    </div>
  </div>
</template>

<style scoped>

.tabs {
  width: 100%;
  min-height: 100%;
  position: relative;
}

.tabs .tab {
  display: none;
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  width: 100%;
  min-height: 100vh;
  min-height: 100dvh;
}

.tabs .tab.active {
  display: block;
  position: relative;
}

@media (min-width: 640px) {
}

@media (min-width: 768px) {
}

@media (min-width: 1024px) {
  .explode .tabs-navigation {
    display: none;
  }

  /* Show navigation on large screens when prop is true */
  .show-nav-large .tabs-navigation {
    display: block;
    border-bottom: 1px solid rgb(230,230,230);
  }

  .explode .tab1 {
    grid-area: tab1;
  }

  .explode .tab2 {
    grid-area: tab2;
  }

  .explode .tab3 {
    grid-area: tab3;
  }

  .explode .tab4 {
    grid-area: tab4;
  }

  .explode .tab5 {
    grid-area: tab5;
  }

  .explode .tab6 {
    grid-area: tab6;
  }

  .explode .tabs {
    margin-top: var(--size-md);
    display: grid;
    gap: 0;
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: auto;
    grid-template-areas:
      "tab1 tab1"
      "tab2 tab2"
      "tab3 tab3"
      "tab4 tab4"
      "tab5 tab5"
      "tab6 tab6";
  }

  .explode .tabs .tab {
    display: flex;
    position: relative;
    min-height: auto;
    scroll-margin-top: calc(var(--header-bar-height) + 80px); /* Offset for sticky navigation */
  }

  .explode.show-nav-large .tabs .tab:last-child {
    min-height: 100vh;
    min-height: 100dvh;
  }
}

@media (min-width: 1280px) {
    /* In exploded mode with navigation, make it sticky */
  .explode.show-nav-large .tabs-navigation {
    display: block;
    position: sticky;
    top: var(--desktop-header-bar-height);
    z-index: var(--layer-1);
    border-bottom: 1px solid rgb(230,230,230);
    background: var(--bg-solid);
  }
}

@media (min-width: 1536px) {
}
</style>