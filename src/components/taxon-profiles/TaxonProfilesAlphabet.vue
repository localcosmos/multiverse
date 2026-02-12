<script setup lang="ts">

import { inject, computed } from 'vue';
import type { TaxonProfiles } from 'localcosmos-client';
import LazyRenderer from '@/components/container/LazyRenderer.vue';
import TaxonProfilesSearchResult from '@/components/taxon-profiles/TaxonProfilesSearchResult.vue';

const props = defineProps<{
  selectedLetter: string|null,
}>();

const taxonProfiles = inject('taxonProfiles') as TaxonProfiles;

const startLetterTaxa = computed(() => {
  if (props.selectedLetter) {
    return taxonProfiles.searchVernacular(props.selectedLetter, null, true);
  } else {
    return [];
  }
});

</script>

<template>
  <div>
    <div class="alphabet-list-container">
      <div v-if="selectedLetter" class="alphabet-list">
        <LazyRenderer
          v-for="taxon in startLetterTaxa"
          :key="`${taxon.name}-${taxon.nameUuid}`"
          :min-height="60"
          class="mb-xs"
        >
          <TaxonProfilesSearchResult class="rounded" :taxon="taxon" />
        </LazyRenderer>
        <div
          v-if="startLetterTaxa.length === 0"
          class="alert alert-error"
        >
          {{ $t('taxonProfiles.noSpeciesFound') }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.alphabet-list-container {
  display: flex;
  flex-direction: row;
  justify-content: center;
}

.alphabet-list-container, .alphabet-list-container > div {
  width: 100%;
}

.alphabet-list {
  display: flex;
  flex-direction: column; /* Default to a single-column layout */
  width: 100%;
  align-items: center;
  padding-left: var(--size-md);
  padding-right: var(--size-md);
}

.alphabet-list > div {
  width: 100%;
}

@media (min-width: 768px) {
  .alphabet-list {
    display: grid; /* Switch to grid layout */
    grid-template-columns: repeat(2, 1fr); /* Two columns for medium screens */
    gap: var(--size-md); /* Add spacing between grid items */
  }

  .alphabet-list-container {
    padding-left: var(--size-md);
    padding-right: var(--size-md);
  }
}

@media (min-width: 1024px) {
  .alphabet-list {
    grid-template-columns: repeat(3, 1fr); /* Three columns for large screens */
  }
}

@media (min-width: 1280px) {
  .alphabet-list-container {
    padding-left: 0;
    padding-right: 0;
  }
  .alphabet-list {
    grid-template-columns: repeat(4, 1fr); /* Four columns for extra-large screens */
  }
}
</style>