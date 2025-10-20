<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useNetworkInformationStore } from '@/stores/network-information';
import TransitionedPage from '@/components/container/TransitionedPage.vue';
import NoNetworkConnectionAlert from '@/components/ui/NoNetworkConnectionAlert.vue';
import { onBeforeMount } from 'vue';

const networkInformationStore = useNetworkInformationStore();
const { isOnline } = storeToRefs(networkInformationStore); 

onBeforeMount(() => {
  networkInformationStore.check();
});
</script>

<template>
  <TransitionedPage>
    <div>
      <slot v-if="isOnline" />
      <div
        v-else
        class="page page-padding"
      >
        <div class="container-small">
          <NoNetworkConnectionAlert />
        </div>
      </div>
    </div>
  </TransitionedPage>
</template>
