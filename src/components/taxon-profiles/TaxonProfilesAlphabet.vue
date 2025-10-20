<script setup lang="ts">
import { ref, inject, onMounted } from 'vue';
import type { SearchTaxon, TaxonProfiles } from 'localcosmos-client';
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue';
import LazyRenderer from '@/components/container/LazyRenderer.vue';
import LetterSelector from '@/components/ui/LetterSelector.vue';
import TaxonProfilesSearchResult from '@/components/taxon-profiles/TaxonProfilesSearchResult.vue';

const taxonProfiles = inject('taxonProfiles') as TaxonProfiles;

const loading = ref<boolean>(true);

const startLetter = ref<null|string>(null);
const startLetterTaxa = ref<SearchTaxon[]>([]);

const availableScientificStartLetters = taxonProfiles.startLetters.taxonLatname;
const availableVernacularStartLetters = taxonProfiles.startLetters.vernacular;

const availableStartLetters = ref<string[]>(availableVernacularStartLetters);


const setStartLetter = (letter: string) => {
  startLetter.value = letter;
  const taxa:SearchTaxon[] = taxonProfiles.searchVernacular(letter, null, true);
  startLetterTaxa.value = taxa;
};

const removeStartLetter = () => {
  startLetter.value = null;
  startLetterTaxa.value = [];
};

onMounted(() => {
  loading.value = false;
  if (availableVernacularStartLetters.length > 0) {
    startLetter.value = availableVernacularStartLetters[0];
   setStartLetter(startLetter.value);
  }
});
</script>

<template>
  <div class="alphabet-list-container">
    <div v-if="loading">
      <LoadingSpinner />
    </div>
    <div v-else>
      <LetterSelector
        id="taxon-profiles"
        :letters="availableStartLetters"
        :current-letter="startLetter"
        @select="setStartLetter"
        @unselect="removeStartLetter"
      />
      <div
        v-if="startLetter"
        class="alphabet-list"
      >
        <LazyRenderer
          v-for="taxon in startLetterTaxa"
          :key="`${taxon.name}-${taxon.nameUuid}`"
          :min-height="60"
        >
          <TaxonProfilesSearchResult :taxon="taxon"></TaxonProfilesSearchResult>
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
    padding-left: calc(var(--navigation-rail-width) + var(--size-md));
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