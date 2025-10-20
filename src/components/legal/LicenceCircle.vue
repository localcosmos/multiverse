<script setup lang="ts">
import { inject, ref } from 'vue';
import type { Ref } from 'vue';
import { PhCopyright } from '@phosphor-icons/vue';
import type { ImageLicence } from 'localcosmos-client';

const props = defineProps<{
  licence?: ImageLicence
  imageUrl?: string
  sharp?: boolean
}>();

const licenceBubble: Ref = inject('licenceBubble') as Ref;

const autoHideId = ref<number | null>(null);

const showBubble = (event: Event) => {
  event.preventDefault();
  event.stopPropagation();
  const eventTarget = event.currentTarget as HTMLElement;

  const clientRect = eventTarget.getBoundingClientRect();
  const x = clientRect.left;
  const y = clientRect.top;
  const licence = props.licence;
  const imageUrl = props.imageUrl;
  licenceBubble.value = {
    licence,
    imageUrl,
    x,
    y,
  };

  window.addEventListener('pointerdown', hideBubble, { once: true });

  if (autoHideId.value) {
    clearTimeout(autoHideId.value);
  }
  autoHideId.value = setTimeout(hideBubble, 3000);
  
};

const hideBubble = (event: Event) => {
  licenceBubble.value = false;
  if (autoHideId.value) {
    clearTimeout(autoHideId.value);
    autoHideId.value = null;
  }
};

</script>

<template>
  <div
    class="licence-circle-container"
    @click="showBubble"
  >
    <div
      class="licence-circle box-shadow cursor-pointer"
      :class="{ 'sharp': sharp }"
    >
      <PhCopyright color="#B0B0B0" :size="18" />
    </div>
  </div>
</template>

<style scoped>
.licence-circle-container {
  width: 40px;
  aspect-ratio: 1/1;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

.licence-circle {
  width: 23px;
  aspect-ratio: 1/1;
  border-radius: 50% 0 var(--border-radius-xs) 0;
  background: rgba(240,240,240);
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  /*box-shadow: 0px 0px 1px 1px rgba(0, 0, 0, .20);*/
  position: relative;
}

.licence-circle.sharp {
  border-radius: 50% 0 0 0;
}
</style>