import 'vue-final-modal/style.css';
import 'ol/ol.css';
import 'vue-awesome-paginate/dist/style.css';
import './assets/css/main.css';

import { createApp } from 'vue';
import { createPinia } from 'pinia';

import App from './App.vue';
import router from './router';

import type { Features, Frontend, FrontendSettings } from 'localcosmos-client';
import { LocalCosmosApi, Glossary, BackboneTaxonomy, TaxonProfiles, LicenceRegistry } from 'localcosmos-client';
import { useAuthStore } from '@/stores/auth';
import { useCookieConsentStore } from './stores/cookie-consent';

import i18next from 'i18next';
import I18NextVue from 'i18next-vue';
import HttpApi from 'i18next-http-backend';

import { t } from 'i18next';
import { PhHouse, PhMapTrifold, PhScan, PhBookOpenText, PhListBullets, PhBooks, PhBinoculars, PhStack } from "@phosphor-icons/vue";

import { useLanguageStore } from '@/stores/language';

import { useMainNavigationStore } from '@/stores/main-navigation';
import type { NavigationButton } from './types/navigation';

import VueAwesomePaginate from "vue-awesome-paginate";

const getDeviceLanguage = (): string => {
  const language = navigator.language.split('-')[0].toLowerCase();
  return language;
}

const setBootloaderText = (text: string) => {
  const bootloaderText = document.getElementById('bootloader-text');
  if (bootloaderText) {
    bootloaderText.textContent = text;
  }
};

const setBootloaderLogo = (frontend: Frontend) => {
  const logo = frontend.userContent.images.logo.imageUrl['2x'];
  const logoContainer = document.getElementById('bootloader-logo');
  if (logo && logoContainer) {
    const image = document.createElement('img');
    image.className = 'bootloader-logo-image';
    image.src = logo;
    logoContainer.appendChild(image);
    logoContainer.classList.add('shown');
  }
};

const loadFeatures = (async ()=> {
  setBootloaderText('loading features');
  const featuresResponse = await fetch('/localcosmos/features.json');
  const features = await featuresResponse.json() as Features;
  return features;
});

const loadNavigations = (isInPreviewMode:boolean, features:Features|Record<string,any>): Record<string, NavigationButton[]> => {

  const navigations: Record<string, NavigationButton[]> = {
    'main' : [],
    'rail' : [],
    'bottom': [],
  };

  const mainNavigation = useMainNavigationStore();

  const homeButton:NavigationButton = {
    genericContent: 'Home',
    icon: PhHouse,
    text: t('navigation.Home'),
    routeName: 'home',
    hasSubmenu: false,
  };
  navigations.main.push(homeButton);
  navigations.rail.push(homeButton);

  const templateContentButton: NavigationButton = {
    genericContent: 'TemplateContent',
    icon: PhBooks,
    text: t('navigation.TemplateContent'),
    routeName: null,
    hasSubmenu: true,
  };

  if (isInPreviewMode == true) {
    if (mainNavigation.templateContent && mainNavigation.templateContent.main) {
      templateContentButton.submenuContent = mainNavigation.templateContent.main;
      navigations.main.push(templateContentButton);
      navigations.rail.push(templateContentButton);
    }
  } else {

    if (features.NatureGuide) {
      const natureGuideButton: NavigationButton = {
        genericContent: 'NatureGuide',
        icon: PhScan,
        text: t('navigation.NatureGuide'),
        routeName: 'nature-guides',
        hasSubmenu: false,
      };

      if (features.NatureGuide && features.NatureGuide.list.length == 1) {
        natureGuideButton.routeName = 'nature-guide-start';
        natureGuideButton.routeParams = {
          guideSlug: features.NatureGuide.list[0].slug,
        };
      }

      navigations.main.push(natureGuideButton);
      navigations.rail.push(natureGuideButton);
    }

    if (features.Map) {

      const mapButton:NavigationButton = {
        genericContent: 'Map',
        icon: PhMapTrifold,
        text: t('navigation.Map'),
        routeName: 'map',
        hasSubmenu: false,
      };

      navigations.main.push(mapButton);
      navigations.rail.push(mapButton);
    }
    
    if (features.GenericForm) {
      const genericFormButton: NavigationButton = {
        genericContent: 'GenericForm',
        icon: PhBinoculars,
        text: t('navigation.Observations'),
        routeName: 'observations',
        hasSubmenu: false,
      };
      navigations.main.push(genericFormButton);
      navigations.rail.push(genericFormButton);
    }

    const taxonProfilesButton:NavigationButton = {
      genericContent: 'TaxonProfiles',
      icon: PhBookOpenText,
      text: t('navigation.TaxonProfiles'),
      routeName: 'taxon-profiles',
      hasSubmenu: false,
    };
    navigations.main.push(taxonProfilesButton);
    navigations.rail.push(taxonProfilesButton);

    if (features.TemplateContent) {
      if (mainNavigation.templateContent && mainNavigation.templateContent.main) {
        templateContentButton.submenuContent = mainNavigation.templateContent.main;
        navigations.main.push(templateContentButton);
        navigations.rail.push(templateContentButton);
      }
    }

    if (features.Glossary) {
      const glossaryButton: NavigationButton = {
        genericContent: 'Glossary',
        icon: PhListBullets,
        text: t('navigation.Glossary'),
        routeName: 'glossary',
        hasSubmenu: false,
      };
      navigations.main.push(glossaryButton);
      navigations.rail.push(glossaryButton);
    }

    // create the bottom navigation
    // replace 5th button with the Stack Button
    // move the Home button into the stack
    if (navigations.main.length > 5) {
      const stackedButtons:NavigationButton[] = navigations.main.slice(5, navigations.main.length);
      stackedButtons.push(navigations.main[0]);
      navigations.bottom = navigations.main.slice(1, 5);
      navigations.rail = navigations.rail.slice(1, 5);

      const stackButton:NavigationButton = {
        genericContent: 'Stack',
        icon: PhStack,
        text: t('navigation.More'),
        routeName: null,
        hasSubmenu: false,
        stackedButtons: stackedButtons,
      };
      

      navigations.bottom.push(stackButton);
      navigations.main.push(stackButton);
      navigations.rail.push(stackButton);
    } else {
      navigations.bottom = navigations.main;
    }

  }

  return navigations;
};


window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
  const isDark = e.matches;
  console.log('Dark mode changed:', isDark);
  // Apply your theme update logic here
});


const onDeviceReady = (async () => {

  const app = createApp(App);
  app.use(createPinia());

  /**
   * load color scheme
   */

  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      console.log('Dark mode is enabled');
  } else {
      console.log('Light mode is enabled');
  }

  /**
   * load localcosmos assets
  */
  setBootloaderText('loading settings');
  const settingsResponse = await fetch('/settings.json');
  const settings: FrontendSettings = await settingsResponse.json();
  app.provide('settings', settings);

  // Initialize the language store
  const languageStore = useLanguageStore();
  languageStore.initializeStore(settings.LANGUAGES, settings.PRIMARY_LANGUAGE);

  document.title = settings.NAME;

  const LCApi = new LocalCosmosApi(settings);
  app.provide('LCApi', LCApi);

  // set app mode
  const isInPreviewMode = settings.PREVIEW;
  app.provide('isInPreviewMode', isInPreviewMode);

  // device is provided by cordova
  // @ts-ignore
  app.provide('device', device);

  let defaultNamespace = 'plain';
  const i18nNamespaces = ['plain'];

  let features:Features|Record<string,any> = {};

  let accountsEnabled = false;

  // load features etc for non-preview mode
  if (isInPreviewMode == false) {
    features = await loadFeatures();
    app.provide('features', features as Features);

    const frontendResponse = await fetch(features.Frontend.path);
    const frontendData:Frontend = await frontendResponse.json();
    app.provide('frontend', frontendData);

    setBootloaderText('loading licences');
    const licenceRegistry = new LicenceRegistry();
    app.provide('licenceRegistry', licenceRegistry);

    const backboneTaxonomy = new BackboneTaxonomy(features.BackboneTaxonomy, languageStore.currentLanguage);
    await backboneTaxonomy.loadSlugs(languageStore.currentLanguage);
    app.provide('backboneTaxonomy', backboneTaxonomy);

    const taxonProfiles = new TaxonProfiles(features.TaxonProfiles);
    taxonProfiles.loadRegistry();
    taxonProfiles.loadLocalizedRegistry(languageStore.currentLanguage);
    await taxonProfiles.load(languageStore.currentLanguage);
    app.provide('taxonProfiles', taxonProfiles);

    // load optional features
    let glossary: Glossary | null = null;
    if (features.Glossary) {
      setBootloaderText('loading glossary');
      glossary = new Glossary(features.Glossary);
      await glossary.load();
      i18nNamespaces.push('glossarized');
    }

    app.provide('glossary', glossary);

    if (glossary !== null) {
      defaultNamespace = 'glossarized';
    }

    if (features.GenericForm && features.GenericForm.list.length > 0){
      accountsEnabled = true;
    }

  } else {
    app.provide('features', {});
  }
  
  app.provide('accountsEnabled', accountsEnabled);

  setBootloaderText('loading translations');
  // init i18next
  await i18next.use(HttpApi).init({
    lng: languageStore.currentLanguage,
    fallbackLng: settings.PRIMARY_LANGUAGE,
    debug: false,
    ns: i18nNamespaces,
    defaultNS: defaultNamespace,
    fallbackNS: 'plain', // if app has no glossary, glossarized is not present
    backend: {
        loadPath: '/locales/{{lng}}/{{ns}}.json',
        crossDomain: true,
    },

  });

  setBootloaderText('loading auth');
  const authStore = useAuthStore();
  await authStore.loadUser();

  app.use(I18NextVue, { i18next });
  app.use(router);
  app.use(VueAwesomePaginate);

  setBootloaderText('loading navigations');
  const mainNavigation = useMainNavigationStore();
  await mainNavigation.loadTemplateContentNavigations();
  const navigations = loadNavigations(isInPreviewMode, features);
  app.provide('navigations', navigations);
  mainNavigation.loadCTAButtons();

  // load cookie sonsent from store
  const cookieConsentStore = useCookieConsentStore();
  cookieConsentStore.loadFromLocalStorage();
  
  app.mount('#app')

});

document.addEventListener('deviceready', onDeviceReady, false);