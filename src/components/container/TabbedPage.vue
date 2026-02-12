<script setup lang="ts">
import { ref, watch, nextTick, onMounted } from 'vue';
import { useTabsStore } from '@/stores/tabs';
import type { TabButtonDefinition } from '@/types/navigation';

import TabButton from '../ui/tabs/TabButton.vue';
import TabSearchButton from '../ui/tabs/TabSearchButton.vue';
import TabAlphabetButton from '../ui/tabs/TabAlphabetButton.vue';

const props = withDefaults(
  defineProps<{
    id: string;
    tabs: TabButtonDefinition[];
    initialTab?: number;
    explodeOnLargeScreens?: boolean;
    showNavOnLargeScreens?: boolean;
  }>(),
  {
    explodeOnLargeScreens: false,
    showNavOnLargeScreens: false,
    initialTab: 1,
  }
);

const emit = defineEmits<{
  (e: 'update:searchText', value: string): void;
  (e: 'selectLetter', value: string): void;
  (e: 'unselectLetter'): void;
}>();

const tabsStore = useTabsStore();
const activeTab = ref<number>(props.initialTab);

// Initialize the active tab from the store if it exists
if (tabsStore.getActiveTab(props.id) !== null) {
  activeTab.value = tabsStore.getActiveTab(props.id)!;
} else {
  tabsStore.registerTabNavigation(props.id);
  tabsStore.setActiveTab(props.id, props.initialTab);
}

// Watch for changes in `activeTab` and update the store
watch(activeTab, (newTab) => {
  tabsStore.setActiveTab(props.id, newTab);
});

// Check if we're in exploded mode on large screens
const isExplodedMode = () => {
  return props.explodeOnLargeScreens && window.innerWidth >= 1024;
};

// Scroll to the appropriate tab section in exploded mode
const scrollToTab = (tabNumber: number) => {
  if (isExplodedMode()) {
    nextTick(() => {
      const tabElement = document.getElementById(`${props.id}-tab${tabNumber}`);
      if (tabElement) {
        const headerOffset = -180; // Adjust based on your header height
        const elementPosition = tabElement.offsetTop;
        const offsetPosition = elementPosition - headerOffset;
        
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  }
};

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

// Function to handle search text emitted by TabButton
const handleSearchText = (text: string) => {
  emit('update:searchText', text);
};

const handleSelectLetter = (letter: string) => {
  emit('selectLetter', letter);
};

const handleUnselectLetter = () => {
  emit('unselectLetter');
};

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

    const observer = new IntersectionObserver((entries) => {
      if (!isExplodedMode()) return;
      
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const tabId = entry.target.id;
          const tabMatch = tabId.match(/tab(\d+)$/);
          if (tabMatch) {
            const tabNumber = parseInt(tabMatch[1]);
            const arrayIndex = props.tabs.findIndex(tab => tab.tabIndex === tabNumber);
            if (arrayIndex !== -1 && arrayIndex !== activeTab.value) {
              activeTab.value = arrayIndex;
            }
          }
        }
      });
    }, observerOptions);

    // Observe all tab elements
    nextTick(() => {
      props.tabs.forEach((_, index) => {
        const tabElement = document.getElementById(`${props.id}-tab${index + 1}`);
        if (tabElement) {
          observer.observe(tabElement);
        }
      });
    });

    // Cleanup observer on unmount
    return () => observer.disconnect();
  }
});
</script>

<template>
  <div :class="[
    explodeOnLargeScreens === true ? 'explode' : '',
    showNavOnLargeScreens === true ? 'show-nav-large' : ''
  ]">
    <div
      v-if="tabs.length > 1"
      id="tabs-navigation"
      class="tabs-navigation page-padding-x bg-solid backdrop-filter"
    >
      <div>
        <!-- select button component-->
         <component
          v-for="(button, counter) in tabs"
          :is="button.type === 'search' ? TabSearchButton : button.type === 'alphabet' ? TabAlphabetButton : TabButton"
          :key="counter"
          :text="button.text"
          :icon="button.icon ? button.icon : null"
          class="cursor-pointer"
          :active="button.tabIndex === activeTab"
          :letters="button.letters ? button.letters : []"
          @click="activateTab(button.tabIndex)"
          v-on="{ ...(button.type === 'alphabet' ? { selectLetter: handleSelectLetter, unselectLetter: handleUnselectLetter } : {}), ...(button.type === 'search' ? { 'update:searchText': handleSearchText } : {}) }"
        />
      </div>
    </div>
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
.tabs-navigation {
  padding-bottom: var(--size-md);
  padding-top: var(--size-md);
  -ms-overflow-style: none;
  scrollbar-width: none;
  overflow-x: scroll;
  position: sticky;
  top: var(--header-bar-height);
  z-index: var(--layer-1);
}

.tabs-navigation::-webkit-scrollbar {
  display: none;
}

.tabs-navigation > div {
  display: flex;
  flex-direction: row;
  gap: var(--gap-medium);
}

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
  .tabs-navigation {
    top: 0;
  }
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

  .tabs-navigation {
    top: var(--desktop-header-bar-height);
  }

  .tabs-navigation > div {
    justify-content: center;
  }

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