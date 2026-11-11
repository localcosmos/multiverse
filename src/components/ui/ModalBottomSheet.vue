<script setup lang="ts">
import { onMounted, reactive, ref, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { storeToRefs } from "pinia";
import { PhCaretDown } from "@phosphor-icons/vue";
import { useModalBottomSheet } from "@/stores/modal-bottomsheet";
import { Directions, Pan, PointerListener } from "contactjs";
import type { GestureEvent, PointerListenerOptions } from "contactjs";

const route = useRoute();
const router = useRouter();
const modalBottomSheet = useModalBottomSheet();

let model = reactive({});

const bottomSheetHead = ref<HTMLElement | null>(null);

const { mode, view, title, collapsedView } = storeToRefs(modalBottomSheet);

// Sync sheet state from the URL: expanding pushes ?modalbottomsheet=expanded onto
// the history stack, so the browser back button naturally collapses the sheet.
watch(
  () => route.query.modalbottomsheet,
  (queryMode) => {
    if (modalBottomSheet.mode === 'hidden') return;
    if (queryMode === 'expanded') {
      modalBottomSheet.expand();
    } else if (modalBottomSheet.mode === 'expanded') {
      modalBottomSheet.collapse();
    }
  },
);

onMounted(() => {
  if (bottomSheetHead.value) {
    const panRecognizer = new Pan(bottomSheetHead.value, {
      supportedDirections: Directions.Vertical,
    });

    const options: Partial<PointerListenerOptions> = {
      supportedGestures: [panRecognizer],
    };

    const pointerListener = new PointerListener(bottomSheetHead.value, options);
  }
});

const onSwipeDown = (event: GestureEvent) => {
  router.go(-1);
};
</script>

<template>
  <div id="BottomSheet" :class="`mode-${mode}`">
    <div id="BottomSheet-Expanded" v-show="mode === 'expanded'">
      <div
        ref="bottomSheetHead"
        id="BottomSheet-Head"
        @swipedown="onSwipeDown"
        @click="router.go(-1)"
      >
        <div class="bottomsheet-close-button cursor-pointer">
          <PhCaretDown :size="32" />
        </div>
        <div class="bottomsheet-title">
          {{ title }}
        </div>
      </div>
      <div id="BottomSheet-Body">
        <component :is="view" v-model="model" />
      </div>
    </div>
    <div
      id="BottomSheet-Collapsed"
      class="cursor-pointer"
      v-show="mode === 'collapsed'"
      @click="router.push({ query: { modalbottomsheet: 'expanded' } })"
    >
      <component :is="collapsedView" v-model="model" />
    </div>
  </div>
</template>

<style>
@layer defaults {
  :root {
    --modal-bottom-sheet-padding-x: var(--size-md);
  }
}
#BottomSheet {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  transition: var(--transition-cubic);
}

#BottomSheet.mode-collapsed {
  transform: translateY(
    calc(
      (
          var(--bottom-navigation-height) + var(--bottom-navigation-offset-bottom) + 7px
        ) *
        (-1)
    )
  );
  width: 100%;
  z-index: var(--layer-2);
  height: var(--collapsed-bottomsheet-height);
}

#BottomSheet-Collapsed {
  padding-left: var(--modal-bottom-sheet-padding-x);
  padding-right: var(--modal-bottom-sheet-padding-x);
  height: var(--collapsed-bottomsheet-height);
}

#BottomSheet.mode-expanded {
  transform: translateY(0);
  height: 100vh;
  height: 100dvh;
  background: rgb(230, 230, 230);
  z-index: var(--layer-4);
  width: 100vw;
  width: 100dvw;
}

#BottomSheet-Body {
  overflow-y: scroll;
  height: calc(100vh - var(--header-bar-height));
  height: calc(100dvh - var(--header-bar-height));
  padding-bottom: var(--size-md);
}

#BottomSheet-Head {
  position: relative;
  width: 100%;
  height: var(--header-bar-height);
  display: grid;
  grid-template-columns: 50px 1fr;
}

.bottomsheet-close-button {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}

.bottomsheet-title {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
}

@media (min-width: 640px) {
}

@media (min-width: 768px) {
  /* Navigation rail is visible — offset the sheet so it doesn't overlap the rail. */
  #BottomSheet {
    left: var(--navigation-rail-width);
    right: 0;
  }

  /* No bottom navigation at this breakpoint — reset the bottom-nav-aware translateY.
     width: auto lets the browser derive the width from left + right (no overflow). */
  #BottomSheet.mode-collapsed {
    transform: translateY(calc(-1 * var(--bottom-navigation-offset-bottom)));
    width: auto;
  }

  /* The explicit 100dvw in mode-expanded overrides left/right, so reset it here. */
  #BottomSheet.mode-expanded {
    width: auto;
  }
}

@media (min-width: 1024px) {
}

@media (min-width: 1280px) {
  #BottomSheet {
    display: none;
  }
}

@media (min-width: 1536px) {
}
</style>
