/**
 * Main Navigation Store
 * this store controls
 * - active main navigation elements
 * - CTA buttons
 * - Template Content Navigation
 */

import { defineStore } from 'pinia';
import { useRoute } from 'vue-router';
import { ref, inject, watch } from 'vue';
import { fetchOfflineContent } from '@/composables/fetchOfflineContent';

import type { Features, FrontendSettings, LocalCosmosApi, TemplateContentNavigation } from 'localcosmos-client';
import { LCApiResultTypes } from 'localcosmos-client';

// Import the language store
import { useLanguageStore } from '@/stores/language';

export const useMainNavigationStore = defineStore('main-navigation', () => {

  const route = useRoute();

  const features = inject('features') as Features;
  const settings = inject('settings') as FrontendSettings;
  const LCApi = inject('LCApi') as LocalCosmosApi;
  
  const languageStore = useLanguageStore();
  
  const isInPreviewMode = inject('isInPreviewMode') as boolean;

  // properties
  const showBurger = ref<boolean>(true);
  const showBackbutton = ref<boolean>(false);
  const currentSubmenu = ref<string|null>(null);
  const activeButton = ref<string|null>(null);

  const observationCTA = ref<boolean>(false);
  const observationCTAvisible = ref<boolean>(false);

  const templateContent = ref<Record<string, TemplateContentNavigation>>({});

  const currentPageTitle = ref<string|null>(null);

  // actions
  function openSubmenu (submenu:string) {
    currentSubmenu.value = submenu;
    hideObservationCTA();
  }
  
  function  closeSubmenu () {
      currentSubmenu.value = null;
      if (route.meta && route.meta.showObservationCTA === true) {
        showObservationCTA();
      }
  }
  
  function toggleSubmenu (submenu:string) {
    if (submenu === currentSubmenu.value){
      activeButton.value = null;
      closeSubmenu();
    } else {
      openSubmenu(submenu);
    }
  }

  function activateButton (buttonType: string) {
    activeButton.value = buttonType;
  }

  function deactivateButton () {
    activeButton.value = null;
  }

  async function loadTemplateContentNavigations () {
    if (isInPreviewMode === true) {
      // use LCApi - this is only done in preview mode: no network connection check required
      if (settings.templateContent && settings.templateContent.navigations) {
        for (const navigationType in settings.templateContent.navigations) {
          // Use language from the store
          const result = await LCApi.getTemplateContentNavigationPreview(
            navigationType, 
            languageStore.currentLanguage
          );
          if (result.type === LCApiResultTypes.success) {
            const navigation = result.data.navigation as TemplateContentNavigation;
            templateContent.value[navigationType] = navigation;
          }
          else {
            console.log(result.error);
          }
        }
      }
    }
    else {
      // Use language from the store
      if (features.TemplateContent && 
          features.TemplateContent.navigations) {

        for (const navigationType in features.TemplateContent.navigations) {

          if (languageStore.currentLanguage in features.TemplateContent.navigations[navigationType]) {

            const navigationPath = features.TemplateContent.navigations[navigationType][languageStore.currentLanguage];
            const { data, error } = await fetchOfflineContent(navigationPath);
            if (data !== null) {
              const navigation = data as TemplateContentNavigation;
              templateContent.value[navigationType] = navigation;
            } else {
              console.log('Error loading template content navigation:', error);
            }
          }
        }
      }
    }
  }

  function loadCTAButtons () {
    if (features.GenericForm && features.GenericForm.list.length > 0) {
      observationCTA.value = true;
    }
  }

  function showObservationCTA () {
    observationCTAvisible.value = true;
  }

  function hideObservationCTA () {
    observationCTAvisible.value = false;
  }

  function setBackbutton (show:boolean) {
    showBackbutton.value = show;
    if (show == true) {
      showBurger.value = false;
    } else {
      showBurger.value = true;
    }
  }

  function setCurrentPageTitle(title: string) {
    currentPageTitle.value = title;
  }

  function removeCurrentPageTitle() {
    currentPageTitle.value = null;
  }

  // Watch for language changes and reload the template content
  watch(() => languageStore.currentLanguage, () => {
    // Reset existing content
    templateContent.value = {};
    // Reload template content with new language
    loadTemplateContentNavigations();
  });

  return { 
    showBackbutton, 
    currentSubmenu, 
    activeButton, 
    observationCTA, 
    observationCTAvisible,
    templateContent, 
    currentPageTitle, 
    showBurger,
    loadTemplateContentNavigations, 
    loadCTAButtons, 
    setBackbutton, 
    setCurrentPageTitle,
    removeCurrentPageTitle, 
    deactivateButton,
    openSubmenu, 
    closeSubmenu, 
    toggleSubmenu, 
    activateButton 
  };
});