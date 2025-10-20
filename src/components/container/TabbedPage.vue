<script setup lang="ts">
import { ref, watch } from 'vue';
import TabButton from '../ui/tabs/TabButton.vue';
import { useTabsStore } from '@/stores/tabs'; // Import the tabs store
import type { TabButtonDefinition } from '@/types/navigation';

const props = withDefaults(
  defineProps<{
    id: string; // Mandatory TabbedPage ID
    tabs: TabButtonDefinition[];
    initialTab?: number;
    explodeOnLargeScreens?: boolean;
  }>(),
  {
    explodeOnLargeScreens: false,
    initialTab: 0,
  }
);

const emit = defineEmits<{
  (e: 'update:searchText', value: string): void; // Emit search text further up
}>();

const tabsStore = useTabsStore(); // Initialize the tabs store
const activeTab = ref<number>(props.initialTab);

// Initialize the active tab from the store if it exists
if (tabsStore.getActiveTab(props.id) !== null) {
  activeTab.value = tabsStore.getActiveTab(props.id)!;
} else {
  tabsStore.registerTabNavigation(props.id); // Register the tabbed page in the store
  tabsStore.setActiveTab(props.id, props.initialTab); // Set the initial tab in the store
}

// Watch for changes in `activeTab` and update the store
watch(activeTab, (newTab) => {
  tabsStore.setActiveTab(props.id, newTab);
});

const activateTab = (tabIndex: number) => {
  activeTab.value = tabIndex;
};

// Function to handle search text emitted by TabButton
const handleSearchText = (text: string) => {
  emit('update:searchText', text); // Emit the search text further up
};
</script>

<template>
  <div :class="explodeOnLargeScreens === true ? 'explode' : ''">
    <div
      v-if="tabs.length > 1"
      class="tabs-navigation page-padding-x bg-solid backdrop-filter"
    >
      <div>
        <TabButton
          v-for="(button, counter) in tabs"
          :search-mode="button.searchMode"
          :key="counter"
          :text="button.text"
          :icon="button.icon ? button.icon : null"
          class="cursor-pointer"
          :active="counter === activeTab"
          @click="activateTab(counter)"
          @update:searchText="handleSearchText"
        />
      </div>
    </div>
    <div class="tabs">
      <div
        v-for="(button, index) in tabs"
        :key="index"
        :class="['tab', `tab${index + 1}`, { active: activeTab === index }]"
      >
        <slot :name="'tab' + (index + 1)"></slot>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tabs-navigation {
  padding-bottom: var(--size-md);
  padding-top: var(--size-md);
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
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
  }
}

@media (min-width: 1280px) {
  .tabs-navigation > div {
    justify-content: center;
  }
}

@media (min-width: 1536px) {
}
</style>