<script setup lang="ts">
import type { ImageWithTextAndLicence } from 'localcosmos-client';
import ImageWithLicence from '../images/ImageWithLicence.vue';

const props = defineProps<{
  image: ImageWithTextAndLicence,
}>();

</script>

<template>
  <div class="card bg-translucent-light padding-medium">
    <div>
      <ImageWithLicence :image="image" rounded="rounded" />
    </div>
    <div class="card-content">
      <slot></slot>
    </div>
    
  </div>
</template>

<style scoped>
.card {
  border-radius: var(--border-radius-sm);
  box-shadow: var(--box-shadow);
  width: 100%;
}

.card-content {
  padding: var(--size-md) 0 0 0;
}
</style>