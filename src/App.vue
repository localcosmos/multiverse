<script setup lang="ts">
import type { LicenceBubbleParameters } from './types/licences';
import type { GlossaryBubbleParameters } from './types/glossary';

import { ref, provide, onMounted, onUnmounted, computed, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { usePushNotificationsStore } from '@/stores/push-notifications';
import { RouterView } from 'vue-router';
import { useModalsStore, MODAL_TYPES } from './stores/modals';
import { useNetworkInformationStore } from '@/stores/network-information';
import HeaderBar from '@/components/navigation/HeaderBar.vue';
import BurgerMenu from '@/components/navigation/BurgerMenu.vue';
import BottomNavigation from './components/navigation/BottomNavigation.vue';
import NavigationRail from './components/navigation/NavigationRail.vue';
import DesktopHeaderBar from '@/components/navigation/DesktopHeaderBar.vue';
import { useMainNavigationStore } from '@/stores/main-navigation';
import CTAObservationButton from './components/ui/CTAObservationButton.vue';
import LicenceBubble from '@/components/legal/LicenceBubble.vue';
import { ModalsContainer } from 'vue-final-modal';
import GlossaryBubble from '@/components/glossary/GlossaryBubble.vue';
import ModalBottomSheet from './components/ui/ModalBottomSheet.vue';
import LoginModal from '@/views/account/LoginModal.vue';
import ModalOverlay from '@/components/modals/ModalOverlay.vue';
import AlphabetOverlay from '@/components/ui/AlphabetOverlay.vue';
import PushNotificationBanner from '@/components/ui/PushNotificationBanner.vue';
import Logo from '@/components/ui/Logo.vue';
import { useKeyboardViewport } from '@/composables/useKeyboardViewport';
import { useContentSecurityPolicy } from '@/composables/useContentSecurityPolicy';
import { useExhibitionModeStore } from '@/stores/exhibition-mode';
import { useIdleTimer } from '@/composables/useIdleTimer';

const router = useRouter();
const route = useRoute();
const mainNavigation = useMainNavigationStore();
const modals = useModalsStore();
const pushNotifications = usePushNotificationsStore();
const networkInformation = useNetworkInformationStore();
networkInformation.init();

useContentSecurityPolicy();
useKeyboardViewport();

const exhibitionMode = useExhibitionModeStore();
useIdleTimer(computed(() => exhibitionMode.isActive));
watch(() => exhibitionMode.isActive, (active) => {
  document.body.classList.toggle('exhibition-mode', active);
}, { immediate: true });

const glossaryBubble = ref<GlossaryBubbleParameters|null>(null);
provide('glossaryBubble', glossaryBubble);

const licenceBubble = ref<LicenceBubbleParameters|null>(null);
provide('licenceBubble', licenceBubble);

let popstateDetected = false;
let capturedState: any = null;

window.addEventListener('popstate', (event: PopStateEvent) => {
  // Capture the state immediately
  capturedState = event.state || {};
  popstateDetected = true;

  setTimeout(() => {
    popstateDetected = false;
    capturedState = null;
  }, 500);
});

const addBackButtonListener = () => {
  router.beforeEach((to, from, next) => {
    // Detect browser back navigation
    if (popstateDetected === true) {
      popstateDetected = false;

      // If any modal is open, close it and prevent navigation
      if (modals.open) {
        modals.closeModal();

        // Maintain URL/history if you closed a modal
        // @ts-ignore
        window.history.pushState(
          capturedState || {},
          '',
          from.fullPath // Stay on the "from" route
        );

        next(false);
        return;
      }
    }

    next();
  });
};

addBackButtonListener();

onMounted(() => {
  window.addEventListener('open-login-modal', () => modals.openModal(MODAL_TYPES.LOGIN));
  //@ts-ignore
  if (device.platform == 'iOS' || device.platform == 'Android') {
    pushNotifications.promptIfNeeded();
  }
});
onUnmounted(() => {
  window.removeEventListener('open-login-modal', () => modals.openModal(MODAL_TYPES.LOGIN));
});

const templateContentViews = [
  'ArticleView',
  'CollectionView',
  'GatewayView',
  'ShortStoryView',
  'StoryView',
  'TaxonArticleCollectionView',
  'TextView',
  'VideoCollectionView',
  'VideoStoryView',
];

// Exclude the bottom-sheet query param from the component key so that opening
// or closing the sheet does not remount the active view (which would reset filter
// selections).  All other query params still form part of the key.
const routeKey = computed(() => {
  const { modalbottomsheet: _omit, ...rest } = route.query;
  const qs = new URLSearchParams(rest as Record<string, string>).toString();
  return qs ? `${route.path}?${qs}` : route.path;
});

let lastScrollX = window.scrollX;
let lastScrollY = window.scrollY;

function handleScroll() {
  if (window.scrollX !== lastScrollX || window.scrollY !== lastScrollY) {
    // console.log('Scroll changed:', { x: window.scrollX, y: window.scrollY });
    lastScrollX = window.scrollX;
    lastScrollY = window.scrollY;
  }
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true });
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>

<template>
  <HeaderBar v-if="!exhibitionMode.isActive || route.meta.headerMode === 'tabs'" />
  <DesktopHeaderBar v-if="!exhibitionMode.isActive || route.meta.headerMode === 'tabs'" />
  <BottomNavigation v-if="!exhibitionMode.isActive" />
  <NavigationRail v-if="!exhibitionMode.isActive" />
  <!-- Use modal store for burger menu state -->
  <BurgerMenu :is-open="modals.isOpen(MODAL_TYPES.BURGER)" :force-button-visible="exhibitionMode.isActive" @close-burger="modals.closeModal" />
  <div v-if="exhibitionMode.isActive" class="exhibition-logo">
    <Logo />
  </div>
  <div>
    <RouterView v-slot="{ Component }">
      <keep-alive :include="templateContentViews" :max="50">
        <component :is="Component" :key="routeKey" />
      </keep-alive>
    </RouterView>
  </div>
  <CTAObservationButton
    v-if="mainNavigation.observationCTA && !exhibitionMode.isActive"
    :class="mainNavigation.observationCTAvisible ? '' : 'cta-hidden'"
  />
  <LicenceBubble
    v-if="licenceBubble"
    :licence="licenceBubble.licence"
    :imageUrl="licenceBubble.imageUrl"
    :x="licenceBubble.x"
    :y="licenceBubble.y"
  />
  <GlossaryBubble
    v-if="glossaryBubble"
    :x="glossaryBubble.x"
    :y="glossaryBubble.y"
    :termB64="glossaryBubble.termB64"
  />
  <ModalBottomSheet />
  <ModalOverlay
    :modal-type="MODAL_TYPES.LOGIN"
    @update:modelValue="val => { if (!val) modals.closeModal(); }"
  >
    <template #title>
      {{ $t('Login') }}
    </template>
    <LoginModal />
  </ModalOverlay>

  <AlphabetOverlay />
  <ModalsContainer />
  <PushNotificationBanner />
</template>

<style scoped>

</style>
