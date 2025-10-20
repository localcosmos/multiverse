// src/stores/language.ts
import { defineStore } from 'pinia';
import { ref } from 'vue';
import i18next from 'i18next';

export const useLanguageStore = defineStore('language', () => {
  // Reactive state - initialize with default value
  const currentLanguage = ref<string>('en');
  const isInitialized = ref<boolean>(false);
  
  // Init function to be called after settings are loaded
  const initializeStore = (languages: string[], primaryLanguage: string) => {
    if (!isInitialized.value) {
      currentLanguage.value = getInitialLanguage(languages, primaryLanguage);
      isInitialized.value = true;
    }
  };

  // Get the initial language
  const getInitialLanguage = (languages: string[], primaryLanguage: string): string => {
    let language = localStorage.getItem('language');

    if (language === null) {
      language = navigator.language.split('-')[0].toLowerCase();
    }

    if (!(languages.includes(language))) {
      language = primaryLanguage;
    }

    localStorage.setItem('language', language);
    return language;
  };
  
  // Actions
  const changeLanguage = async (lang: string, languages: string[]) => {
    if (languages.includes(lang)) {
      // Save in localStorage
      localStorage.setItem('language', lang);
      
      // Update i18next
      await i18next.changeLanguage(lang);
      
      // Update store state
      currentLanguage.value = lang;
    }
  };
  
  return {
    currentLanguage,
    isInitialized,
    initializeStore,
    changeLanguage
  };
});