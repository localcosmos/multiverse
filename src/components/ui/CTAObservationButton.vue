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
    class="cta-button bg-translucent"
    @click="goToNewObservation"
  >
    <PhNotePencil :size="32" />
  </div>
</template>

<style scoped>
.cta-button {
  position: fixed;
  bottom: 100px;
  right: var(--size-md);
  z-index: var(--layer-1);
  border-radius: 50%;
  width: 80px;
  aspect-ratio: 1/1;
  display: flex;
  justify-content: center;
  align-items: center;
  transform: scale3d(1,1,1);
  transform-origin: center center;
  transition: var(--transition-cubic);
  opacity: 1;
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