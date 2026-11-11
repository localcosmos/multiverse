<script setup lang="ts">
import { PhNotePencil } from '@phosphor-icons/vue';
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
    class="rail-cta cursor-pointer"
    @click="goToNewObservation"
  >
    <PhNotePencil :size="32" />
  </div>
</template>

<style>
@layer defaults {
  :root {
    --rail-cta-bg: rgba(255,255,255,.7);
    --darkmode-rail-cta-bg: rgba(0, 0, 0, 0.7);
  }
}

.rail-cta {
  width: 60px;
  aspect-ratio: 1/1;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  background: var(--rail-cta-bg);
  border-radius: 25%;
  margin-bottom: var(--size-md);
}

body.dark .rail-cta {
  background: var(--darkmode-rail-cta-bg);
}

@media (min-width: 640px) {
}

@media (min-width: 768px) {

}

@media (min-width: 1024px) {

}

@media (min-width: 1280px) {

}

@media (min-width: 1536px) {
}

@media (orientation: landscape) {
  .rail-cta {
    display: none;
  }
}

@media (orientation: landscape) and (min-height: 500px){
  .rail-cta {
    display: flex;
  }
}
</style>
