<script setup lang="ts">
import { PhNotePencil } from "@phosphor-icons/vue";
import { inject } from 'vue';
import { useRouter } from 'vue-router';
import type { Features } from 'localcosmos-client';

const router = useRouter();
const features = inject('features') as Features;

const goToNewObservation = () => {
  if (features.GenericForm){
    if (features.GenericForm.list.length === 1) {
      router.push({ name: 'observation-form' })
    } else {
      router.push({ name: 'observation-forms-list' });
    }
  } else {
    console.warn('GenericForm feature is not available.');
  }
};
</script>

<template>
  <div
    class="cta-button"
    @click="goToNewObservation"
  >
    <PhNotePencil :size="32" />
  </div>
</template>

<style>
@layer defaults {
  :root {
    --cta-button-bg: rgba(0,0,0,.7);
    --cta-button-color: #FFF;

    --darkmode-cta-button-bg: rgba(255,255,255,.7);
    --darkmode-cta-button-color: #000;
  }
}

.cta-button {
  position: fixed;
  bottom: calc(100px + env(safe-area-inset-bottom, 0px));
  right: var(--size-sm);
  z-index: var(--layer-1);
  border-radius: 50%;
  width: 80px;
  aspect-ratio: 1/1;
  display: flex;
  justify-content: center;
  align-items: center;
  transform: scale3d(1,1,1);
  background: var(--cta-button-bg);
  transform-origin: center center;
  transition: var(--transition-cubic);
  opacity: 1;
  color: var(--cta-button-color);
}

body.dark .cta-button {
  background: var(--darkmode-cta-button-bg);
  color: var(--darkmode-cta-button-color);
}

.cta-hidden {
  transform: scale3d(0,0,0);
  opacity: 0;
}

@media (min-width: 640px) {

}

@media (orientation:portrait) and (min-width: 768px) {
  .cta-button {
    display: none;
  }
}

@media (min-width: 768px) {
  .cta-button {
    bottom: var(--size-md);
  }
}


@media (min-width: 1024px) {

}

@media (min-width: 1280px) {

}

@media (min-width: 1536px) {

}

@media (orientation: landscape) and (min-height: 500px){
  .cta-button {
    display: none;
  }
}
</style>
