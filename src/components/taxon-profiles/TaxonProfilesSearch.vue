<script setup lang="ts">
import { ref, watch, inject } from 'vue';
import TaxonProfilesSearchResult from '@/components/taxon-profiles/TaxonProfilesSearchResult.vue';

import type { SearchTaxon, TaxonProfiles } from 'localcosmos-client';

const taxonProfiles = inject('taxonProfiles') as TaxonProfiles;

// Props to receive the search text
const props = defineProps<{
  searchText: string, // Search text passed from the parent component
}>();

const searchResults = ref<SearchTaxon[]>([]);
const searched = ref<boolean>(false);

// Define the searchTaxon function
const searchTaxon = (query: string) => {
  if (query.length >= 2) {
    searched.value = true;
    try {
      // Use the taxonProfiles search function to fetch results
      const results = taxonProfiles.search(query);
      searchResults.value = results; // Update the search results
    } catch (error) {
      console.error('Error during search:', error);
      searchResults.value = []; // Clear results on error
    }
  } else {
    searched.value = false;
    searchResults.value = []; // Clear results if query is too short
  }
};

// Watch for changes in the searchText prop and execute searchTaxon
watch(
  () => props.searchText,
  (newQuery) => {
    searchTaxon(newQuery);
  },
  { immediate: true } // Run the watcher immediately on component mount
);
</script>

<template>
  <div>
    <div v-if="searchResults.length > 0">
      <div v-for="(taxon, index) in searchResults" :key="index">
        <TaxonProfilesSearchResult :taxon="taxon" />
      </div>
    </div>
    <div v-else>
      <p v-if="searched">No results found</p>
    </div>
  </div>
</template>

<style scoped>
</style>