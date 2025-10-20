<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';

const page = ref<HTMLElement>();

onMounted(() => {
  setTimeout(()=> {
    if (page.value) {
      page.value.classList.add('faded-in');
    }
  }, 50);
});

onBeforeUnmount(() => {
  if (page.value) {
    page.value.classList.remove('faded-in');
  }
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
