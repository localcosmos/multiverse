/**
 * Main Navigation Store
 * this store controls
 * - active main navigation elements
 * - CTA buttons
 * - Template Content Navigation
 */

import { defineStore } from 'pinia';
import { useRoute } from 'vue-router';
import { ref, inject, watch, markRaw } from 'vue';
import { fetchOfflineContent } from '@/composables/fetchOfflineContent';

import type { Features, Frontend, FrontendSettings, LocalCosmosApi, TemplateContentNavigation } from 'localcosmos-client';
import { LCApiResultTypes } from 'localcosmos-client';
import { t } from 'i18next';
import {
  PhHouse,
  PhMapTrifold,
  PhScan,
  PhBookOpenText,
  PhListBullets,
  PhBooks,
  PhBinoculars,
  PhStack,
} from '@phosphor-icons/vue';
import type { NavigationButton } from '@/types/navigation';

// Import the language store
import { useLanguageStore } from '@/stores/language';

export const useMainNavigationStore = defineStore('main-navigation', () => {

  const route = useRoute();

  const features = inject('features') as Features;
  const settings = inject('settings') as FrontendSettings;
  const LCApi = inject('LCApi') as LocalCosmosApi;

  const languageStore = useLanguageStore();

  const isInPreviewMode = inject('isInPreviewMode') as boolean;
  const frontend = inject('frontend', null) as Frontend | null;

  // properties
  const showBurger = ref<boolean>(true);
  const showBackbutton = ref<boolean>(false);
  const currentSubmenu = ref<string|null>(null);
  const activeButton = ref<string|null>(null);

  const observationCTA = ref<boolean>(false);
  const observationCTAvisible = ref<boolean>(false);

  const templateContent = ref<Record<string, TemplateContentNavigation>>({});

  const currentPageTitle = ref<string|null>(null);
  const navigations = ref<Record<string, NavigationButton[]>>({ main: [], rail: [], bottom: [] });

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

  function buildNavigations() {
    const nav: Record<string, NavigationButton[]> = {
      'main': [],
      'rail': [],
      'bottom': [],
    };

    const homeButton: NavigationButton = {
      genericContent: 'Home',
      icon: markRaw(PhHouse),
      text: t('navigation.Home'),
      routeName: 'home',
      route: null,
      hasSubmenu: false,
    };

    if (!frontend?.userContent?.images?.logoWithText?.imageUrl) {
      nav.main.push(homeButton);
    }

    // bottom and rail always include home regardless of logoWithText
    nav.bottom.push(homeButton);
    nav.rail.push(homeButton);

    const templateContentButton: NavigationButton = {
      genericContent: 'TemplateContent',
      icon: markRaw(PhBooks),
      text: t('navigation.TemplateContent'),
      routeName: null,
      route: null,
      hasSubmenu: false,
    };

    if (templateContent.value && templateContent.value.main) {
      templateContentButton.route = templateContent.value.main[0].url;
      templateContentButton.text = t(templateContent.value.main[0].linkName);
    }

    if (isInPreviewMode == true) {
      if (templateContent.value && templateContent.value.main) {
        nav.main.push(templateContentButton);
        nav.bottom.push(templateContentButton);
        nav.rail.push(templateContentButton);
      }
    } else {
      if (features.NatureGuide) {
        const natureGuideButton: NavigationButton = {
          genericContent: 'NatureGuide',
          icon: markRaw(PhScan),
          text: t('navigation.NatureGuide'),
          routeName: 'nature-guides',
          route: null,
          hasSubmenu: false,
        };

        if (features.NatureGuide && features.NatureGuide.list.length == 1) {
          natureGuideButton.routeName = 'nature-guide-start';
          natureGuideButton.routeParams = {
            guideSlug: features.NatureGuide.list[0].slug,
          };
        }

        nav.main.push(natureGuideButton);
        nav.bottom.push(natureGuideButton);
        nav.rail.push(natureGuideButton);
      }

      if (features.Map) {
        const mapButton: NavigationButton = {
          genericContent: 'Map',
          icon: markRaw(PhMapTrifold),
          text: t('navigation.Map'),
          routeName: 'map',
          route: null,
          hasSubmenu: false,
        };

        nav.main.push(mapButton);
        nav.bottom.push(mapButton);
        nav.rail.push(mapButton);
      }

      if (features.GenericForm) {
        const genericFormButton: NavigationButton = {
          genericContent: 'GenericForm',
          icon: markRaw(PhBinoculars),
          text: t('navigation.Observations'),
          routeName: 'observations',
          route: null,
          hasSubmenu: false,
        };
        nav.main.push(genericFormButton);
        nav.bottom.push(genericFormButton);
        nav.rail.push(genericFormButton);
      }

      const taxonProfilesButton: NavigationButton = {
        genericContent: 'TaxonProfiles',
        icon: markRaw(PhBookOpenText),
        text: t('navigation.TaxonProfiles'),
        routeName: 'taxon-profiles',
        route: null,
        hasSubmenu: false,
      };
      nav.main.push(taxonProfilesButton);
      nav.bottom.push(taxonProfilesButton);
      nav.rail.push(taxonProfilesButton);

      if (features.TemplateContent) {
        if (templateContent.value && templateContent.value.main) {
          nav.main.push(templateContentButton);
          nav.bottom.push(templateContentButton);
          nav.rail.push(templateContentButton);
        }
      }

      if (features.Glossary) {
        const glossaryButton: NavigationButton = {
          genericContent: 'Glossary',
          icon: markRaw(PhListBullets),
          text: t('navigation.Glossary'),
          routeName: 'glossary',
          route: null,
          hasSubmenu: false,
        };
        nav.main.push(glossaryButton);
        nav.bottom.push(glossaryButton);
        nav.rail.push(glossaryButton);
      }

      const maxBottomButtons = 5;
      const maxRailButtons = 5;

      // home stays at index 0; overflow stacks items from index 4 onwards
      if (nav.bottom.length > maxBottomButtons) {
        const bottomStackedButtons: NavigationButton[] = nav.bottom.slice(maxBottomButtons - 1);
        nav.bottom = nav.bottom.slice(0, maxBottomButtons - 1);

        const bottomStackButton: NavigationButton = {
          genericContent: 'Stack',
          icon: markRaw(PhStack),
          text: t('navigation.More'),
          routeName: null,
          route: null,
          hasSubmenu: false,
          stackedButtons: bottomStackedButtons,
        };

        nav.bottom.push(bottomStackButton);
      }

      if (nav.rail.length > maxRailButtons) {
        const railStackedButtons: NavigationButton[] = nav.rail.slice(maxRailButtons - 1);

        const railStackButton: NavigationButton = {
          genericContent: 'Stack',
          icon: markRaw(PhStack),
          text: t('navigation.More'),
          routeName: null,
          route: null,
          hasSubmenu: false,
          stackedButtons: railStackedButtons,
        };
        nav.rail = nav.rail.slice(0, maxRailButtons - 1);
        nav.rail.push(railStackButton);
      }
    }

    navigations.value = nav;
  }

  // Watch for language changes and reload the template content
  watch(() => languageStore.currentLanguage, async () => {
    templateContent.value = {};
    await loadTemplateContentNavigations();
    buildNavigations();
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
    navigations,
    buildNavigations,
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
