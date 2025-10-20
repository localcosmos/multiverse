<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { PhCaretDown } from '@phosphor-icons/vue';
import { useModalBottomSheet } from '@/stores/modal-bottomsheet';
import { Directions, Pan, PointerListener } from 'contactjs';
import type { GestureEvent, PointerListenerOptions } from 'contactjs';
import { useRoute } from 'vue-router';

const route = useRoute();
const modalBottomSheet = useModalBottomSheet();

const model = reactive({});

const router = useRouter();

const bottomSheetHead = ref<HTMLElement | null>(null);

// Convert all state properties to reactive references to be used on view
const { mode, view, title, collapsedView } = storeToRefs(modalBottomSheet);

const goToQuery = (modalbottomsheet: string) => {
  if (route.query.modalbottomsheet === modalbottomsheet) {
    // If already expanded, call expand directly
    modalBottomSheet.expand();
  } else {
    // Otherwise, update the query to trigger the watcher
    router.push({ query: { modalbottomsheet } });
  }
};

watch(
  () => route.query.modalbottomsheet,
  (mode) => {
    switch (mode) {
      case 'expanded':
        modalBottomSheet.expand();
        break;
      default:
        if (modalBottomSheet.mode === 'expanded') {
          modalBottomSheet.collapse();
        }
        break;
    }
  }
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
      <div id="BottomSheet-Body" class="page-padding-x">
        <component :is="view" v-model="model" />
      </div>
    </div>
    <div
      id="BottomSheet-Collapsed"
      class="page-padding-x cursor-pointer"
      v-show="mode === 'collapsed'"
      @click="goToQuery('expanded')"
    >
      <component :is="collapsedView" v-model="model" />
    </div>
  </div>
</template>

<style scoped>
#BottomSheet {
  position: fixed;
  transition: var(--transition-cubic);
}

#BottomSheet.mode-collapsed {
  transform: translateY(calc( (var(--bottom-navigation-height) + var(--bottom-navigation-offset-bottom) + var(--collapsed-bottomsheet-height) + 7px) * (-1) ));
  width: 100%;
  z-index: var(--layer-2);
  height: var(--collapsed-bottomsheet-height);
}

#BottomSheet-Collapsed {
  height: var(--collapsed-bottomsheet-height);
}

#BottomSheet.mode-expanded {
  transform: translateY(-100vh);
  transform: translateY(-100dvh);
  height: 100vh;
  height: 100dvh;
  background: rgb(230,230,230);
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
