import { defineStore } from 'pinia';

interface CookieConsentState {
  youtube: boolean;
  vimeo: boolean;
  initialized: boolean;
}

export const useCookieConsentStore = defineStore('cookieConsent', {
  state: (): CookieConsentState => ({
    youtube: false,
    vimeo: false,
    initialized: false
  }),

  getters: {
    hasYoutubeConsent: (state) => state.youtube,
    hasVimeoConsent: (state) => state.vimeo,
    hasAnyConsent: (state) => state.youtube || state.vimeo
  },

  actions: {
    acceptYoutube() {
      this.youtube = true;
      this.saveToLocalStorage();
    },

    rejectYoutube() {
      this.youtube = false;
      this.saveToLocalStorage();
    },

    handleYoutubeToggle(value: boolean) {
      this.youtube = value;
      this.saveToLocalStorage();
    },

    acceptVimeo() {
      this.vimeo = true;
      this.saveToLocalStorage();
    },

    rejectVimeo() {
      this.vimeo = false;
      this.saveToLocalStorage();
    },

    handleVimeoToggle(value: boolean) {
      this.vimeo = value;
      this.saveToLocalStorage();
    },

    acceptAll() {
      this.youtube = true;
      this.vimeo = true;
      this.saveToLocalStorage();
    },

    rejectAll() {
      this.youtube = false;
      this.vimeo = false;
      this.saveToLocalStorage();
    },

    saveToLocalStorage() {
      localStorage.setItem('cookie-consent', JSON.stringify({
        youtube: this.youtube,
        vimeo: this.vimeo,
        timestamp: Date.now()
      }));
    },

    loadFromLocalStorage() {
      if (this.initialized) return;
      
      const stored = localStorage.getItem('cookie-consent');
      if (stored) {
        const data = JSON.parse(stored);
        this.youtube = data.youtube || false;
        this.vimeo = data.vimeo || false;
      }
      this.initialized = true;
    }
  }
});