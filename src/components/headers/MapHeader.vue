<script setup lang="ts">
import HorizontalScroll from '../container/HorizontalScroll.vue';
import MapFilters from '@/views/maps/MapFilters.vue';

</script>

<template>
  <div class="map-header">
    <HorizontalScroll>
      <MapFilters />
    </HorizontalScroll>
  </div>
</template>

<style scoped>
.map-header {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding-left: var(--size-md);
}

@media (min-width: 640px) {
}

@media (min-width: 768px) {
  .map-header {
    padding-left: 0;
  }
}

@media (min-width: 1024px) {

}

@media (min-width: 1280px) {
}

@media (min-width: 1536px) {
}
</style>