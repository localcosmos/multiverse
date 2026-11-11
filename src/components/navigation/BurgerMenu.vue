<script setup lang="ts">
import { ref, onMounted, inject } from "vue";
import type { GestureEvent } from "contactjs";
import { PointerListener, Pan } from "contactjs";
import type { PointerListenerOptions } from "contactjs";
import type { Frontend } from "localcosmos-client";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useModalsStore, MODAL_TYPES } from "@/stores/modals";
import { useMainNavigationStore } from "@/stores/main-navigation";
import { useExhibitionModeStore } from "@/stores/exhibition-mode";

import { PhList, PhX, PhCaretLeft } from "@phosphor-icons/vue";
import LogoWithText from '@/components/ui/LogoWithText.vue';

defineProps<{
  isOpen: boolean;
  forceButtonVisible?: boolean;
}>();

const auth = useAuthStore();
const modals = useModalsStore();
const mainNavigation = useMainNavigationStore();
const router = useRouter();
const exhibitionMode = useExhibitionModeStore();

const isInPreviewMode = inject("isInPreviewMode") as boolean;
const frontend = inject("frontend") as Frontend;
const accountsEnabled = inject("accountsEnabled", false) as boolean;

const emit = defineEmits(["openBurger", "closeBurger"]);

const panActive = ref<boolean>(false);
const panPossible = ref<boolean>(true);
const ticking = ref<boolean>(false);
const eventTarget = ref();

const burgerMenuPosition = ref<string>("left");

const burgerMenu = ref<HTMLElement | null>(null);

let animationFrameId: number | null = null;

const open = () => {
  // Only push if not already open (avoid stacking)
  emit("openBurger");
};

const close = () => {
  if (window.history.state && window.history.state.burgerMenu) {
    window.history.back();
  } else {
    emit("closeBurger");
  }
};

const requestElementUpdate = (element: HTMLElement, transformString: any) => {
  if (ticking.value === false) {
    animationFrameId = requestAnimationFrame(function (timestamp) {
      element.style.transform = transformString;

      animationFrameId = null;
      ticking.value = false;
    });

    ticking.value = true;
  }
};

const panstart = (event: GestureEvent) => {
  eventTarget.value = event.currentTarget;
  if (burgerMenuPosition.value == "right" && event.detail.live.direction === "left") {
    panPossible.value = false;
  } else if (burgerMenuPosition.value == "left" && event.detail.live.direction === "right") {
    panPossible.value = false;
  }

  document.getElementById("burger-content")?.classList.add("blockscroll");
  document.getElementById("burger-menu")?.classList.add("notransition");
};

const pan = (event: GestureEvent) => {
  const eventTarget = event.currentTarget as HTMLElement;
  if (panPossible.value === true) {
    if (panActive.value === false) {
      panActive.value = true;
    }

    // transform
    let x = event.detail.global.deltaX;
    const y = 0;

    if (burgerMenuPosition.value == "right" && x < 0) {
      x = 0;
    } else if (burgerMenuPosition.value == "left" && x > 0) {
      x = 0;
    }

    const transformString = "translate3d(" + x + "px, " + y + "px, 0)";

    if (event.currentTarget) {
      requestElementUpdate(eventTarget, transformString);
    }
  }
};

const panend = (event: GestureEvent) => {
  document.getElementById("burger-content")?.classList.remove("blockscroll");
  document.getElementById("burger-menu")?.classList.remove("notransition");

  if (ticking.value === true) {
    setTimeout(function () {
      panend(event);
    }, 100);
  } else {
    panActive.value = false;
    let closeMenu = false;

    if (burgerMenuPosition.value == "right") {
      if (event.detail.global.deltaX > eventTarget.value.clientWidth / 2.8) {
        closeMenu = true;
      }
    } else if (burgerMenuPosition.value == "left") {
      if (event.detail.global.deltaX < -eventTarget.value.clientWidth / 2.8) {
        closeMenu = true;
      }
    }

    eventTarget.value.style.transform = "";
    if (panPossible.value === true && closeMenu === true) {
      emit("closeBurger");
    } else {
      emit("openBurger");
    }
    panPossible.value = true;
  }
};

const onMenuClick = () => {
  if (modals.isModalOpen(MODAL_TYPES.BURGER)) {
    close();
  } else {
    modals.openModal(MODAL_TYPES.BURGER);
  }
};

const onBackClick = () => {
  router.back();
};

onMounted(() => {
  if (burgerMenu.value) {
    // @ts-ignore - improve types in contactjs
    const options: PointerListenerOptions = {
      supportedGestures: [Pan],
      handleTouchEvents: true, // setting to "true" interferes with vue cropper
    };

    const pointerListener = new PointerListener(burgerMenu.value, options);
  }
});
</script>

<template>
  <div class="absolute">
    <div
      ref="burgerMenu"
      id="burger-menu"
      class="burger-menu"
      :class="{ open: isOpen }"
      @swiperight="close"
      @pan="pan"
      @panstart="panstart"
      @panend="panend"
    >
      <div>
        <div
          v-if="mainNavigation.showBackbutton"
          @click="onBackClick"
          class="burger-button cursor-pointer"
          :style="forceButtonVisible ? { display: 'flex' } : {}"
        >
          <div>
            <PhCaretLeft :size="24" />
          </div>
        </div>
        <div v-else class="burger-button cursor-pointer" :style="forceButtonVisible ? { display: 'flex' } : {}" @click="onMenuClick">
          <div>
            <PhX v-if="isOpen" size="24" />
            <PhList v-else :size="24" />
          </div>
        </div>
        <div id="burger-content">
          <div v-if="isInPreviewMode">
            <div class="preview-message">
              {{ $t("burgerMenu.previewMessage") }}
            </div>
          </div>
          <div v-else class="burger-links">
            <template v-if="exhibitionMode.isActive">
              <RouterLink :to="{ name: 'exhibition-mode-settings' }" class="burger-link">
                {{ $t('burgerMenu.exhibitionModeSettings') }}
              </RouterLink>
            </template>
            <template v-else>
            <div v-if="frontend.userContent?.images?.logoWithText?.imageUrl" class="burger-menu__logo mb-2xl">
              <LogoWithText />
            </div>
            <!-- Account or other main links go here -->
            <RouterLink v-if="accountsEnabled" :to="{ name: 'my-account' }" class="burger-link">
              <span v-if="auth.isAuthenticated">
                {{ $t("burgerMenu.myAccount") }}
              </span>
              <span v-else>
                {{ $t("burgerMenu.login") }}
              </span>
            </RouterLink>

                        <!-- Settings -->
            <RouterLink :to="{ name: 'app-settings' }" class="burger-link">
              {{ $t("burgerMenu.appSettings") }}
            </RouterLink>

            <!-- Separator -->
            <div class="burger-section-separator"></div>



            <!-- Legal links -->
            <RouterLink :to="{ name: 'privacy-settings' }" class="burger-link">
              {{ $t("burgerMenu.privacySettings") }}
            </RouterLink>
            <RouterLink
              v-if="frontend.userContent?.texts.termsOfUse"
              :to="{ name: 'legal', params: { id: 'termsOfUse' } }"
              class="burger-link"
            >
              {{ $t("burgerMenu.termsOfUse") }}
            </RouterLink>
            <RouterLink
              v-if="frontend.userContent?.texts.legalNotice"
              :to="{ name: 'legal', params: { id: 'legalNotice' } }"
              class="burger-link"
            >
              {{ $t("burgerMenu.legalNotice") }}
            </RouterLink>
            <RouterLink
              v-if="frontend.userContent?.texts.privacyPolicy"
              :to="{ name: 'legal', params: { id: 'privacyPolicy' } }"
              class="burger-link"
            >
              {{ $t("burgerMenu.privacyPolicy") }}
            </RouterLink>
            </template>
          </div>
        </div>
      </div>
    </div>

    <div
      id="modal-back"
      class="navbar-modal-back"
      :class="{ open: isOpen }"
      @click="$emit('closeBurger')"
      @swiperight="$emit('closeBurger')"
    ></div>
  </div>
</template>

<style>
@layer defaults {
  :root {
    --burger-menu-bg: rgba(255, 255, 255, 1);
    --burger-menu-box-shadow: 0px 0px 5px 2px rgba(0, 0, 0, 0.1);
    --burger-button-bg: var(--bg-translucent-light);
    --burger-button-box-shadow: 0px 0px 4px rgba(0, 0, 0, 0.2);
    --burger-button-color: #000;
    --burger-preview-msg-bg: rgb(150, 150, 150);
    --burger-modal-bg: rgba(0, 0, 0, 0.5);
    --burger-preview-msg-color: #000;
    --burger-section-separator-border: 1px solid rgb(220, 220, 220);
    --burger-link-color: #000;

    --darkmode-burger-menu-bg: rgba(0, 0, 0, 1);
    --darkmode-burger-button-bg: #FFF;
    --darkmode-burger-button-color: #000;
    --darkmode-burger-button-box-shadow: 0px 0px 4px rgba(0, 0, 0, 0.2);
    --darkmode-burger-preview-msg-bg: rgb(100, 100, 100);
    --darkmode-burger-preview-msg-color: #FFF;
    --darkmode-burger-modal-bg: rgba(0, 0, 0, 0.7);
    --darkmode-burger-section-separator-border: 1px solid rgb(100, 100, 100);
    --darkmode-burger-link-color: #FFF;
  }
}

.burger-menu {
  width: 80vw;
  height: 100vh; /* old browsers */
  height: 100dvh; /* new browsers */
  box-shadow: var(--burger-menu-box-shadow);
  position: fixed;
  z-index: 39;
  top: 0;
  /*right: 0; left: auto;*/
  /*transform: translate3d(103%, 0, 0);*/
  right: auto;
  left: 0;
  transform: translate3d(-103%, 0, 0);
  user-select: none;
  touch-action: none;
  opacity: 1;
  background: var(--burger-menu-bg);
}

body.dark .burger-menu {
  background: var(--darkmode-burger-menu-bg);
}

.burger-menu__logo {
  display: flex;
  justify-content: center;
  align-items: flex-start;
}
.burger-menu__logo img {
  width: auto;
  height: 40px;
}

.burger-menu.open {
  transform: translate3d(0, 0, 0);
  opacity: 1;
}

.burger-menu > div {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.burger-button {
  position: absolute;
  top: 0;
  right: calc(var(--header-bar-height) * (-1));
  width: var(--header-bar-height);
  height: var(--header-bar-height);
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  background: var(--burger-button-bg);
  border-radius: 0 25px 25px 0;
  backdrop-filter: none; /** make text below readable */
  box-shadow: var(--burger-button-box-shadow);
  padding-left: 9px;
  padding-top: 3px;
  color: var(--burger-button-color);
}

body.dark .burger-button {
  background: var(--darkmode-burger-button-bg);
  box-shadow: var(--darkmode-burger-button-box-shadow);
}

.burger-menu.open .burger-button {
  box-shadow: none;
}

.burger-menu .top {
  height: var(--header-bar-height);
  width: 100%;
  flex-grow: 0;
  z-index: 39;
  display: flex;
  flex-direction: row;
  align-items: center;
  /*justify-content: flex-start;*/
  justify-content: flex-end;
  position: relative;
}

.burger-links {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
}

.burger-links a {
  text-decoration: none;;
}

.burger-links a,
.burger-links a:visited,
.burger-links a:hover {
  color: var(--burger-link-color);
}

.burger-link {
  padding: 8px 0px;
  cursor: pointer;
  text-decoration: none;
  width: 100%;
  color: var(--burger-link-color);
}

body.dark .burger-link {
  color: var(--darkmode-burger-link-color);
}

body.dark .burger-links a,
body.dark .burger-links a:visited,
body.dark .burger-links a:hover {
  color: var(--darkmode-burger-link-color);
}

#burger-content {
  width: 100%;
  flex-grow: 1;
  z-index: 99;
  /* padding: 15px 15px 50px 50px; */
  overflow-y: scroll;
  touch-action: pan-y;
  height: calc(100vh - var(--header-bar-height));
  height: calc(100dvh - var(--header-bar-height));
  padding: var(--size-md);
}

#burger-content .preview-message {
  background: var(--burger-preview-msg-bg);
  color: var(--burger-preview-msg-color);
  padding: var(--size-md);
  border-radius: var(--border-radius);
}

body.dark #burger-content .preview-message {
  background: var(--darkmode-burger-preview-msg-bg);
  color: var(--darkmode-burger-preview-msg-color);
}

.navbar-modal-back {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100vw;
  height: 100vh; /* old browsers */
  height: 100dvh; /* new browsers */
  background-color: var(--burger-modal-bg);
  z-index: -1;
  opacity: 0;
  touch-action: pan-x;
}

body.dark .navbar-modal-back {
  background-color: var(--darkmode-burger-modal-bg);
}

.burger-menu,
.navbar-modal-back {
  /*transition: all 0.3s cubic-bezier(0.07, 0.58, 0.49, 0.93);*/
  transition: var(--transition-cubic);
}

.navbar-modal-back.open {
  z-index: 99;
  opacity: 1;
}

.burger-section-separator {
  width: 100%;
  height: 12px;
  margin: 0 0 var(--size-md) 0;
  border-bottom: var(--burger-section-separator-border);
  opacity: 0.7;
}

body.dark .burger-section-separator {
  border-bottom: var(--darkmode-burger-section-separator-border);
}

@media (min-width: 640px) {
  .burger-menu {
    width: 70vw;
  }
}

@media (min-width: 768px) {
  .burger-menu {
    width: 420px;
    height: auto;
    left: 0;
    right: auto;
    transform: translate3d(-103%, 0, 0);
  }

  .burger-button {
    display: none;
  }
}

@media (min-width: 1024px) {
  #burger-content {
    width: 100%;
    flex-grow: 1;
    z-index: 99;
    overflow-y: scroll;
  }
}

@media (min-width: 1280px) {
  .burger-button {
    display: flex;
    height: var(--desktop-header-bar-height);
  }
}

@media (min-width: 1536px) {
}
</style>
