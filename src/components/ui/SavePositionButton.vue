<script setup lang="ts">
import { ref } from 'vue';
import { PhCheckCircle } from '@phosphor-icons/vue';
import { useGeolocationStore } from '@/stores/geolocation';
import ColorButton from './ColorButton.vue';
import { t } from 'i18next';

import type { SimpleGeolocationPosition } from '@/types/geolocation';

const props = defineProps<{
  position: SimpleGeolocationPosition,
}>();

const geolocation = useGeolocationStore();
const saved = ref(false);

const savePosition = () => {
  geolocation.savePosition(props.position);
  saved.value = true;
};
</script>

<template>
  <div class="flex flex-row items-center justify-start gap-4">
    <ColorButton
      class="bg-primary"
      @click="savePosition"
      :text="t('geolocation.savePosition')"
    >
    </ColorButton>
    <div v-if="saved">
      <PhCheckCircle color="rgb(96, 206, 81)" size="32" />
    </div>
  </div>
</template>
