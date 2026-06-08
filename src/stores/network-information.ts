import { defineStore } from 'pinia';

interface State {
  isOnline: boolean
}

export const useNetworkInformationStore = defineStore('network', {
  state: (): State => ({
    isOnline: navigator.onLine,
  }),
  actions: {
    init () {
      window.addEventListener('online', () => { this.isOnline = true; });
      window.addEventListener('offline', () => { this.isOnline = false; });
    },
  }
});