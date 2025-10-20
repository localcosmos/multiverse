<script setup lang="ts">
import TransitionedPage from './TransitionedPage.vue';
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue';

const props = defineProps<{
  loading: boolean
}>();
</script>

<template>
  <TransitionedPage>
    <div v-if="loading" class="h-full page">
      <div class="centered-flex-rows">
        <div>
          <LoadingSpinner />
        </div>
      </div>
    </div>
    <div
      v-else
      class="page"
    >
      <div>
        <slot />
      </div>
    </div>
  </TransitionedPage>
</template>

<style scoped>
</style>

