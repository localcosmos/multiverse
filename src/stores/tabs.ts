import { defineStore } from 'pinia';

interface TabDict {
  activeTab: number | null;
}

type Tabs = Record<string, TabDict>;

export const useTabsStore = defineStore('tabs', {
  state: () => ({
    tabs: {} as Tabs,
  }),
  actions: {
    registerTabNavigation(tabId: string) {
      if (!this.tabs[tabId]) {
        this.tabs[tabId] = { activeTab: null };
      }
    },
    setActiveTab(tabId: string, activeTab: number) {
      if (this.tabs[tabId]) {
        this.tabs[tabId].activeTab = activeTab;
      }
    },
    getActiveTab(tabId: string): number | null {
      return this.tabs[tabId]?.activeTab ?? null;
    },
  },
});