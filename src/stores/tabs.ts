import { defineStore } from 'pinia';
import { markRaw } from 'vue';
import type { TabButtonDefinition } from '@/types/navigation';

const sanitizeTabs = (tabs: TabButtonDefinition[]): TabButtonDefinition[] =>
  tabs.map((tab) => ({
    ...tab,
    icon: tab.icon ? markRaw(tab.icon) : tab.icon,
  }));

interface TabDict {
  activeTab: number | null;
  tabs: TabButtonDefinition[];
  showInMobileHeader: boolean;
  searchText: string;
}

type Tabs = Record<string, TabDict>;

interface RegisterTabNavigationOptions {
  tabs?: TabButtonDefinition[];
  initialTab?: number | null;
  showInMobileHeader?: boolean;
}

export const useTabsStore = defineStore('tabs', {
  state: () => ({
    tabs: {} as Tabs,
    headerTabNavigationId: null as string | null,
  }),
  actions: {
    registerTabNavigation(tabId: string, options: RegisterTabNavigationOptions = {}) {
      const {
        tabs = [],
        initialTab = null,
        showInMobileHeader = false,
      } = options;

      const sanitized = sanitizeTabs(tabs);

      if (!this.tabs[tabId]) {
        this.tabs[tabId] = {
          activeTab: initialTab,
          tabs: sanitized,
          showInMobileHeader,
          searchText: '',
        };
        return;
      }

      // Keep activeTab when already set, but refresh metadata when re-registering.
      this.tabs[tabId].tabs = sanitized;
      this.tabs[tabId].showInMobileHeader = showInMobileHeader;

      if (this.tabs[tabId].activeTab === null && initialTab !== null) {
        this.tabs[tabId].activeTab = initialTab;
      }
    },

    setActiveTab(tabId: string, activeTab: number) {
      if (!this.tabs[tabId]) {
        this.registerTabNavigation(tabId);
      }

      this.tabs[tabId].activeTab = activeTab;
    },

    getActiveTab(tabId: string): number | null {
      return this.tabs[tabId]?.activeTab ?? null;
    },

    setTabDefinitions(tabId: string, tabs: TabButtonDefinition[]) {
      if (!this.tabs[tabId]) {
        this.registerTabNavigation(tabId, { tabs });
        return;
      }

      this.tabs[tabId].tabs = sanitizeTabs(tabs);
    },

    setShowInMobileHeader(tabId: string, showInMobileHeader: boolean) {
      if (!this.tabs[tabId]) {
        this.registerTabNavigation(tabId, { showInMobileHeader });
        return;
      }

      this.tabs[tabId].showInMobileHeader = showInMobileHeader;
    },

    setHeaderTabNavigation(tabId: string | null) {
      if (tabId === null) {
        this.headerTabNavigationId = null;
        return;
      }

      if (!this.tabs[tabId]) {
        this.registerTabNavigation(tabId);
      }

      this.headerTabNavigationId = tabId;
    },

    clearHeaderTabNavigation() {
      this.headerTabNavigationId = null;
    },

    getHeaderTabNavigation() {
      if (!this.headerTabNavigationId) {
        return null;
      }

      return this.tabs[this.headerTabNavigationId] ?? null;
    },

    setSearchText(tabId: string, text: string) {
      if (!this.tabs[tabId]) return;
      this.tabs[tabId].searchText = text;
    },
    
    unregisterTabNavigation(tabId: string) {
      if (this.headerTabNavigationId === tabId) {
        this.headerTabNavigationId = null;
      }

      delete this.tabs[tabId];
    },
  },
});