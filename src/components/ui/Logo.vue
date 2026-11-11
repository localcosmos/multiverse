<script setup lang="ts">
import { computed, inject } from 'vue';
import type { Frontend } from 'localcosmos-client';
import { useAppSettingsStore } from '@/stores/app-settings';

const frontend = inject('frontend') as Frontend;
const appSettings = useAppSettingsStore();

const src = computed(() => {
  if (appSettings.isDark && frontend.userContent?.images.logoDarkMode?.imageUrl) {
    return frontend.userContent?.images.logoDarkMode.imageUrl['2x'];
  }
  return frontend.userContent?.images.logo?.imageUrl?.['2x'] ?? null;
});
</script>

<template>
  <img v-if="src" :src="src" />
</template>
