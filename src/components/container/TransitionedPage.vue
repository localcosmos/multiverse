<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, onActivated, onDeactivated } from 'vue';

const page = ref<HTMLElement>();
let fadeTimer: ReturnType<typeof setTimeout> | null = null;

const clearFadeTimer = () => {
  if (fadeTimer) {
    clearTimeout(fadeTimer);
    fadeTimer = null;
  }
};

const fadeIn = () => {
  clearFadeTimer();
  if (!page.value) {
    return;
  }

  page.value.classList.remove('faded-in');

  fadeTimer = setTimeout(() => {
    if (page.value) {
      page.value.classList.add('faded-in');
    }
    fadeTimer = null;
  }, 50);
};

const resetFade = () => {
  clearFadeTimer();
  if (page.value) {
    page.value.classList.remove('faded-in');
  }
};

onMounted(() => {
  fadeIn();
});

onActivated(() => {
  fadeIn();
});

onDeactivated(() => {
  resetFade();
});

onBeforeUnmount(() => {
  resetFade();
});

</script>

<template>
  <div
    ref="page"
    class="transitioned-page"
  >
    <slot />
  </div>
</template>

<style scoped>
.transitioned-page {
  transition: var(--transition-cubic);
  transform: scale3d(.85, .85, .85);
  transform-origin: center;
  opacity: 0;
  width: 100%;
  min-height: 100%;
}

.transitioned-page.faded-in {
  opacity: 1;
  transform: scale3d(1, 1, 1)
}
</style>
