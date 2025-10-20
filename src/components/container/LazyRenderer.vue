<script setup lang="ts">
// inspired by: https://medium.com/js-dojo/lazy-rendering-in-vue-to-improve-performance-dcccd445d5f
import { useIntersectionObserver } from '@vueuse/core';
import { ref, nextTick } from 'vue';

interface Props {
  renderOnIdle?: boolean,
  unrender?: boolean,
  minHeight: number,
  unrenderDelay?: number,
}

const props = withDefaults(defineProps<Props>(), {
  renderOnIdle: false,
  unrender: false,
  unrenderDelay: 10000,
});

const onIdle = (cb = () => {}) => {
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(cb);
  } else {
    setTimeout(() => {
      nextTick(cb);
    }, 300);
  }
};

const shouldRender = ref(false);
const target = ref();
const fixedMinHeight = ref(0);

let unrenderTimer: number;
let renderTimer: number;

const { stop } = useIntersectionObserver(
  target,
  ([{ isIntersecting }]: { isIntersecting: boolean}[]) => {
    if (isIntersecting) {
      clearTimeout(unrenderTimer);
      renderTimer = window.setTimeout(
        () => (shouldRender.value = true),
        props.unrender ? 200 : 0,
      );
      shouldRender.value = true;
      if (!props.unrender) {
        stop();
      }
    } else if (props.unrender) {
      // if the component was set to render, cancel that
      clearTimeout(renderTimer);
      unrenderTimer = window.setTimeout(() => {
        fixedMinHeight.value = target.value?.clientHeight || 0;
        shouldRender.value = false;
      }, props.unrenderDelay);
    }
  },
  {
    rootMargin: '600px',
  },
);

if (props.renderOnIdle) {
  onIdle(() => {
    shouldRender.value = true;
    if (!props.unrender) {
      stop();
    }
  });
}
</script>

<template>
  <div ref="target" :style="`min-height:${fixedMinHeight ? fixedMinHeight : minHeight}px`">
    <slot v-if="shouldRender" />
  </div>
</template>
