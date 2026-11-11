import 'vue-final-modal/style.css';
import 'ol/ol.css';
import 'vue-awesome-paginate/dist/style.css';
import './assets/css/main.css';
import './assets/css/beachexplorer.css';

import { createApp } from 'vue';
import { createPinia } from 'pinia';

import App from './App.vue';
import router from './router';

import type { Features, Frontend, FrontendSettings } from "localcosmos-client";
import {
  LocalCosmosApi,
  Glossary,
  BackboneTaxonomy,
  TaxonProfiles,
  TemplateContent,
  LicenceRegistry,
} from "localcosmos-client";
import { useAuthStore } from "@/stores/auth";
import { useCookieConsentStore } from "./stores/cookie-consent";

import i18next from 'i18next';
import I18NextVue from 'i18next-vue';
import HttpApi from 'i18next-http-backend';

import { useLanguageStore } from '@/stores/language';

import { useMainNavigationStore } from '@/stores/main-navigation';
import { useAppSettingsStore } from '@/stores/app-settings';

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

const setDocumentBackground = (frontend: Frontend) => {
  const images = frontend.userContent.images;

  const portraitBackground = images.backgroundImage?.imageUrl?.['4x']
    || images.backgroundImage?.imageUrl?.['2x']
    || images.backgroundImage?.imageUrl?.['1x'];

  const landscapeBackground = images.landscapeBackgroundImage?.imageUrl?.['4x']
    || images.landscapeBackgroundImage?.imageUrl?.['2x']
    || images.landscapeBackgroundImage?.imageUrl?.['1x']
    || portraitBackground;

  const portraitBackgroundDark = images.backgroundImageDarkmode?.imageUrl?.['4x']
    || images.backgroundImageDarkmode?.imageUrl?.['2x']
    || images.backgroundImageDarkmode?.imageUrl?.['1x']
    || portraitBackground;

  const landscapeBackgroundDark = images.landscapeBackgroundImageDarkmode?.imageUrl?.['4x']
    || images.landscapeBackgroundImageDarkmode?.imageUrl?.['2x']
    || images.landscapeBackgroundImageDarkmode?.imageUrl?.['1x']
    || landscapeBackground;

  const root = document.documentElement;

  if (portraitBackground) {
    root.style.setProperty('--app-background-image-portrait', `url("${portraitBackground}")`);
  }

  if (landscapeBackground) {
    root.style.setProperty('--app-background-image-landscape', `url("${landscapeBackground}")`);
  }

  if (portraitBackgroundDark) {
    root.style.setProperty('--app-background-image-portrait-dark', `url("${portraitBackgroundDark}")`);
  }

  if (landscapeBackgroundDark) {
    root.style.setProperty('--app-background-image-landscape-dark', `url("${landscapeBackgroundDark}")`);
  }

  document.body.classList.add('has-app-background');
};

const loadFeatures = (async ()=> {
  setBootloaderText('loading features');
  const featuresResponse = await fetch('/localcosmos/features.json');
  const features = await featuresResponse.json() as Features;
  return features;
});



const onDeviceReady = async () => {

  const app = createApp(App);
  app.use(createPinia());

  // Initialize app settings early so dark mode class is applied before rendering
  useAppSettingsStore();

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

  let features: Features | Record<string, any> = {};

  let accountsEnabled = false;

  let frontend: Frontend | null = null;

  // load features etc for non-preview mode
  if (isInPreviewMode == false) {
    features = await loadFeatures();
    app.provide('features', features as Features);

    const frontendResponse = await fetch(features.Frontend.path);
    const frontendData:Frontend = await frontendResponse.json();
    frontend = frontendData;
    app.provide('frontend', frontendData);

    setDocumentBackground(frontendData);

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
      await glossary.load(languageStore.currentLanguage);
      i18nNamespaces.push('glossarized');
    }

    app.provide('glossary', glossary);

    if (glossary !== null) {
      defaultNamespace = 'glossarized';
    }

    if (features.GenericForm && features.GenericForm.list.length > 0) {
      accountsEnabled = true;
    }

    if (features.TemplateContent) {
      setBootloaderText('loading template content');
      const templateContent = new TemplateContent(features.TemplateContent);
      await templateContent.load(languageStore.currentLanguage);
      app.provide('templateContent', templateContent);
    }

  } else {
    app.provide('features', {});
    // provide a minimal stub so components injecting 'frontend' don't crash
    app.provide('frontend', { userContent: { images: {}, texts: {} } });
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
  mainNavigation.buildNavigations();
  app.provide('navigations', mainNavigation.navigations);
  mainNavigation.loadCTAButtons();

  // load cookie sonsent from store
  const cookieConsentStore = useCookieConsentStore();
  cookieConsentStore.loadFromLocalStorage();

  app.mount('#app')

};

document.addEventListener('deviceready', onDeviceReady, false);
