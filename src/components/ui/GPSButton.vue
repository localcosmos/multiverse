<script setup lang="ts">
import { ref } from 'vue';
import { useGeolocationStore, GeolocationState } from '@/stores/geolocation';
import { PhGpsFix, PhGps } from '@phosphor-icons/vue';

const emit = defineEmits(['activated']);
const geolocation = useGeolocationStore();

const isActive = ref<boolean>(false);

if (geolocation.watchId) {
  isActive.value = true;
}

geolocation.$subscribe((mutation, state) => {
  if (state.watchId) {
    isActive.value = true;
  } else {
    isActive.value = false;
  }
});

const activate = () => {
  geolocation.activateGeolocation();
  emit('activated');
};
</script>

<template>
  <div
    class="gps-button cursor-pointer"
    @click="activate()"
  >
    <div v-if="isActive" :class="geolocation.status === GeolocationState.success ? '' : 'blink'">
      <PhGpsFix :size="24" />
    </div>
    <div v-else>
      <PhGps :size="24" />
    </div>
  </div>
</template>

<style scoped>
.gps-button {
  width: 45px;
  aspect-ratio: 1/1;
  background: #FFF;
  border-radius: .3em;
}

.gps-button, .gps-button > div {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
