<script setup lang="ts">
import type { LicenceBubbleParameters } from './types/licences';
import type { GlossaryBubbleParameters } from './types/glossary';

import { ref, provide, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { RouterView } from 'vue-router';
import { useModalsStore, MODAL_TYPES } from './stores/modals';
import HeaderBar from '@/components/navigation/HeaderBar.vue';
import BurgerMenu from '@/components/navigation/BurgerMenu.vue';
import BottomNavigation from './components/navigation/BottomNavigation.vue';
import NavigationRail from './components/navigation/NavigationRail.vue';
import { useMainNavigationStore } from '@/stores/main-navigation';
import CTAObservationButton from './components/ui/CTAObservationButton.vue';
import LicenceBubble from '@/components/legal/LicenceBubble.vue';
import { ModalsContainer } from 'vue-final-modal';
import GlossaryBubble from '@/components/glossary/GlossaryBubble.vue';
import ModalBottomSheet from './components/ui/ModalBottomSheet.vue';
import LoginModal from '@/views/account/LoginModal.vue';
import ModalOverlay from '@/components/modals/ModalOverlay.vue';

const router = useRouter();
const mainNavigation = useMainNavigationStore();
const modals = useModalsStore();

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
});
onUnmounted(() => {
  window.removeEventListener('open-login-modal', () => modals.openModal(MODAL_TYPES.LOGIN));
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
  <HeaderBar />
  <BottomNavigation />
  <NavigationRail />
  <!-- Use modal store for burger menu state -->
  <BurgerMenu :is-open="modals.isOpen(MODAL_TYPES.BURGER)" @close-burger="modals.closeModal" />
  <div class="backrop-filter bg-translucent">
    <RouterView />
  </div>
  <CTAObservationButton v-if="mainNavigation.observationCTA" :class="mainNavigation.observationCTAvisible ? '' : 'cta-hidden'" />
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

  <ModalsContainer />
</template>

<style scoped>

</style>
