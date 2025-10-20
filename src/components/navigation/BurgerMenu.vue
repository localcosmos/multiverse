<script setup lang="ts">
import { ref, onMounted, inject } from 'vue';
import { useRouter } from 'vue-router';
import type { GestureEvent } from 'contactjs';
import { PointerListener, Pan } from 'contactjs';
import type { PointerListenerOptions } from 'contactjs';
import type { Frontend } from 'localcosmos-client';
import { useAuthStore } from '@/stores/auth';

defineProps<{
  isOpen : boolean,
}>();

const auth = useAuthStore();

const isInPreviewMode = inject('isInPreviewMode') as boolean;
const frontend = inject('frontend') as Frontend;
const accountsEnabled = inject('accountsEnabled', false) as boolean;

const router = useRouter();
router.beforeEach(() => {
  emit('closeBurger');
});

const emit = defineEmits(['openBurger', 'closeBurger']);

const panActive = ref(false);
const panPossible = ref(true);
const ticking = ref(false);
const eventTarget = ref();

const burgerMenuPosition = ref<string>('left');

const burgerMenu = ref<HTMLElement | null>(null);

let animationFrameId: number | null = null;

const open = () => {
  // Only push if not already open (avoid stacking)
  emit('openBurger');
};

const close = () => {
  if (window.history.state && window.history.state.burgerMenu) {
    window.history.back();
  } else {
    emit('closeBurger');
  }
};

const requestElementUpdate = (element: HTMLElement, transformString:any) => {
  if (ticking.value === false) {
    animationFrameId = requestAnimationFrame(function (timestamp) {
      element.style.transform = transformString;

      animationFrameId = null;
      ticking.value = false;
    });

    ticking.value = true;
  }
}

const panstart = (event: GestureEvent) => {
  eventTarget.value = event.currentTarget;
  if (burgerMenuPosition.value == 'right' && event.detail.live.direction === 'left') {
    panPossible.value = false;
  } else if (burgerMenuPosition.value == 'left' && event.detail.live.direction === 'right') {
    panPossible.value = false;
  }

  document.getElementById('burger-content')?.classList.add('blockscroll');
  document.getElementById('burger-menu')?.classList.add('notransition');
}

const pan = (event: GestureEvent) => {
  const eventTarget = event.currentTarget as HTMLElement;
  if (panPossible.value === true) {
    if (panActive.value === false) {
      panActive.value = true;
    }

    // transform
    let x = event.detail.global.deltaX;
    const y = 0;

    if (burgerMenuPosition.value == 'right' && x < 0) {
      x = 0;
    } else if (burgerMenuPosition.value == 'left' && x > 0) {
      x = 0;
    }

    const transformString = 'translate3d(' + x + 'px, ' + y + 'px, 0)';

    if (event.currentTarget) {
      requestElementUpdate(eventTarget, transformString);
    }
  }
}

const panend = (event: GestureEvent) => {
  document.getElementById('burger-content')?.classList.remove('blockscroll');
  document.getElementById('burger-menu')?.classList.remove('notransition');

  if (ticking.value === true) {
    setTimeout(function () {
      panend(event);
    }, 100);
  } else {
    panActive.value = false;
    let closeMenu = false;

    if (burgerMenuPosition.value == 'right') {
      if (event.detail.global.deltaX > (eventTarget.value.clientWidth / 2.8)) {
        closeMenu = true;
      }
    } else if (burgerMenuPosition.value == 'left') {
      if (event.detail.global.deltaX < (-eventTarget.value.clientWidth / 2.8)) {
        closeMenu = true;
      }
    }

    
    eventTarget.value.style.transform = '';
    if (panPossible.value === true && closeMenu === true) {
      emit('closeBurger');
    } else {
      emit('openBurger');
    }
    panPossible.value = true;
  }
}

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
      class="burger-menu bg-solid"
      :class="{ open: isOpen }"
      @swiperight="close"
      @pan="pan"
      @panstart="panstart"
      @panend="panend"
    >
      <div>
        <div class="top">
          <div class="burger-close cursor-pointer" @click="$emit('closeBurger')">
            <img src="@/assets/icons/close.svg" />
          </div>
        </div>
        <div id="burger-content">
          <div v-if="isInPreviewMode">
            <div class="preview-message text-solid-inverse">
              {{ $t('burgerMenu.previewMessage') }}
            </div>
          </div>
          <div v-else class="burger-links nolinkstyle">
            <!-- Account or other main links go here -->
            <RouterLink
              v-if="accountsEnabled"
              :to="{ name: 'my-account' }"
              class="burger-link"
            >
              <span v-if="auth.isAuthenticated">
                {{ $t('burgerMenu.myAccount') }}
              </span>
              <span v-else>
                {{ $t('burgerMenu.login') }}
              </span>
            </RouterLink>

            <!-- Separator -->
            <div class="burger-section-separator"></div>

            <!-- Legal links -->
            <RouterLink
              v-if="frontend.userContent?.texts.termsOfUse"
              :to="{ name: 'legal', params: {id:'termsOfUse'} }"
              class="burger-link"
            >
              {{ $t('burgerMenu.termsOfUse') }}
            </RouterLink>
            <RouterLink
              v-if="frontend.userContent?.texts.legalNotice"
              :to="{ name: 'legal', params: {id:'legalNotice'} }"
              class="burger-link" 
            >
              {{ $t('burgerMenu.legalNotice') }}
            </RouterLink>
            <RouterLink
              v-if="frontend.userContent?.texts.privacyPolicy"
              :to="{ name: 'legal', params: {id:'privacyPolicy'} }"
              class="burger-link"
            >
              {{ $t('burgerMenu.privacyPolicy') }}
            </RouterLink>
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
.burger-menu {
  width: 80vw;
  height: 100vh; /* old browsers */  
  height: 100dvh; /* new browsers */
  box-shadow: 0px 0px 5px 2px rgba(0, 0, 0, 0.1);
  position: fixed;
  z-index: 100;
  top: 0;
  /*right: 0; left: auto;*/
  /*transform: translate3d(103%, 0, 0);*/
  right: auto; left: 0;
  transform: translate3d(-103%, 0, 0);
  user-select: none;
  touch-action: none;
  opacity: 1;
}

.burger-menu.open {
  transform: translate3d(0, 0, 0);
  opacity: 1;
}

.burger-menu > div {
  position: relative;
  width: 100%;
  height:100%;
  display: flex;
  flex-direction: column;
}

.burger-menu .top {
  height: var(--header-bar-height);
  width: 100%;
  flex-grow: 0;
  z-index: 100;
  display: flex;
  flex-direction: row;
  align-items: center;
  /*justify-content: flex-start;*/
  justify-content: flex-end;
}

.burger-close {
  height: 100%;
  aspect-ratio: 1/1;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}

.burger-links {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
}

.burger-link {
  padding: 8px 0px;
  cursor: pointer;
  text-decoration: none;
  width: 100%;
}

#burger-content {
  width:100%;
  flex-grow:1;
  z-index: 99;
  /* padding: 15px 15px 50px 50px; */
  overflow-y: scroll;
  touch-action: pan-y;
  height: calc(100vh - var(--header-bar-height));
  height: calc(100dvh - var(--header-bar-height));
  padding: var(--size-md);
}

#burger-content .preview-message{
  background: var(--color-grey);
  padding: var(--size-md);
  border-radius: var(--border-radius);
}

.navbar-modal-back {
  position:fixed;
  top: 0; left:0; right:0; bottom:0;
  width: 100vw;
  height: 100vh; /* old browsers */  
  height: 100dvh; /* new browsers */
  background-color: var(--color-black-translucent-light);
  z-index: -1;
  opacity: 0;
  touch-action: pan-x;
}

.burger-menu, .navbar-modal-back {
  /*transition: all 0.3s cubic-bezier(0.07, 0.58, 0.49, 0.93);*/
  transition: var(--transition-cubic);
}

.navbar-modal-back.open {
  z-index: 99;
  opacity:1;
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
  .navbar-modal-back {
    background-color: rgba(0,0,0,0.3);
  }

  .burger-menu .top {
    justify-content: flex-end;
  }
}


@media (min-width: 1024px) {

  #burger-content {
    width:100%;
    flex-grow:1;
    z-index: 99;
    overflow-y: scroll;
  }
}


@media (min-width: 1280px) {
}


@media (min-width: 1536px) {

}

.burger-section-separator {
  width: 100%;
  height: 12px;
  margin: 0 0 var(--size-md) 0;
  border-bottom: 1px solid var(--color-grey-light, #e0e0e0);
  opacity: 0.7;
}
</style>
