<script setup lang="ts">
import { ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useMapStore } from '@/stores/map';
import { t } from 'i18next';

import TabButton from '@/components/ui/tabs/TabButton.vue';

const mapStore = useMapStore();

const {
  availableObservationFormModulations,
  availableTaxonomicModulations,
} = storeToRefs(mapStore);


const activeTaxonFilter = ref<string | null>(null); 
const activeObservationFormFilter = ref<string | null>(null);

const toggleTaxonFilter = (name:string|number) => {
  if (activeTaxonFilter.value === name) {
    activeTaxonFilter.value = null; // Deselect if already active
    mapStore.resetFilters(); // Clear the filter
    return;
  }
  mapStore.applyTaxonomicFilter(name.toString());
  activeTaxonFilter.value = `${name}`; // Update the active filter
  activeObservationFormFilter.value = null; // Reset observation form filter when changing taxon filter
};

const toggleObservationFormFilter = (name:string|number) => {
  if (activeObservationFormFilter.value === name) {
    activeObservationFormFilter.value = null; // Deselect if already active
    mapStore.resetFilters(); // Clear the filter
    return;
  }
  mapStore.applyObservationFormFilter(name.toString());
  activeObservationFormFilter.value = `${name}`; // Update the active filter
  activeTaxonFilter.value = null; // Reset taxon filter when changing observation form filter
};
</script>

<template>
  <div
    id="map-filters"
    ref="filterSheet"
    class="map-filters"
  >
    <div
      v-for="(modulation, key) in availableObservationFormModulations"
      :key="key"
    >
      <TabButton
        :text="t(`${key}`)"
        :active="activeObservationFormFilter === `${key}`"
        variant="solid"
        @click="toggleObservationFormFilter(key)"
      >
      </TabButton>
    </div>
    <div
      v-for="(modulation, key) in availableTaxonomicModulations"
      :key="key"
    >
      <TabButton
        :text="t(`${key}`)"
        :active="activeTaxonFilter === `${key}`"
        variant="solid"
        @click="toggleTaxonFilter(key)"
      >
      </TabButton>
    </div>
  </div>
</template>

<style>
.map-filters {
  position: absolute;
  top: var(--header-bar-height);
  width: 100vw;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  padding: var(--size-md);
  gap: var(--size-md);
  z-index: var(--layer-1);
}

@media (min-width: 550px) {
}

@media (min-width: 640px) {
}

@media (min-width: 768px) {
  .map-filters {
    top: 0;
    width: calc(100vw - var(--navigation-rail-width));
    left: var(--navigation-rail-width);
  }
}

@media (min-width: 1024px) {
}

@media (min-width: 1280px) {
  .map-filters {
    top: var(--desktop-header-bar-height);
    width: 100vw;
    left: 0;
  }
}

@media (min-width: 1536px) {
}
</style>
