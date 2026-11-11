<script setup lang="ts">
import { ref, watch, inject } from "vue";
import TaxonProfilesSearchResult from "@/components/taxon-profiles/TaxonProfilesSearchResult.vue";

import type { SearchTaxon, TaxonProfiles } from "localcosmos-client";

const taxonProfiles = inject("taxonProfiles") as TaxonProfiles;

// Props to receive the search text
const props = defineProps<{
  searchText: string; // Search text passed from the parent component
}>();

const searchResults = ref<SearchTaxon[]>([]);
const searched = ref<boolean>(false);

// Define the searchTaxon function
const searchTaxon = (query: string) => {
  console.log("Executing search for query:", query);

  if (query.length >= 2) {
    searched.value = true;
    try {
      // Use the taxonProfiles search function to fetch results
      const results = taxonProfiles.search(query);
      console.log("Search results:", results);
      searchResults.value = results; // Update the search results
    } catch (error) {
      console.error("Error during search:", error);
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
  { immediate: true }, // Run the watcher immediately on component mount
);
</script>

<template>
  <div class="taxon-profiles-search">
    <div v-if="searchResults.length > 0">
      <div
        v-for="(taxon, index) in searchResults"
        :key="index"
        class="taxon-profiles-search__result"
      >
        <TaxonProfilesSearchResult :taxon="taxon" />
      </div>
    </div>
    <div v-else>
      <p v-if="searched">No results found</p>
    </div>
  </div>
</template>

<style>
.taxon-profiles-search {

}
.taxon-profiles-search > div {
  display: flex;
  flex-direction: column;
}

.taxon-profiles-search__result {
  border-bottom: 1px solid rgba(0,0,0,0.1);
}

@media (min-width: 768px) {
  .taxon-profiles-search {

  }

  .taxon-profiles-search > div {
  }

  .taxon-profiles-search__result {

  }

}

@media (min-width: 1024px) {

}

@media (min-width: 768px) {

}

@media (min-width: 1024px) {

}

@media (min-width: 1280px) {

}
</style>
