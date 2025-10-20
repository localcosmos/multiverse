<script setup lang="ts">
import type { SearchTaxon } from 'localcosmos-client';

const props = defineProps<{
  searchResults: SearchTaxon[]
}>();

const emit = defineEmits(['selectedTaxon']);

const selectTaxon = (taxon: SearchTaxon) => {
  emit('selectedTaxon', taxon);
};
</script>

<template>
  <div
    ref="searchResultBox"
    class="search-results"
  >
    <div v-if="searchResults.length">
      <div
        v-for="(result, index) in searchResults"
        :key="index"
        class="search-result"
        @click="selectTaxon(result)"
      >
        <span v-if="result.name">
          {{ result.name }}
        </span>
        <span v-else>
          {{ result.taxonLatname }} {{ result.taxonAuthor }}
        </span>
      </div>
    </div>
    <div
      v-else
      class="no-results"
    >
      {{ $t('search.noResults') }}
    </div>
  </div>
</template>

<style scoped>
.search-results {
  background: #FFF;
  min-width: 100px;
  position: absolute;
  z-index: 5;
  top: 50px;
  left: 40px;
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  padding: var(--size-md);
}
.search-results .no-results {
  color: var(--color-error);
}

.search-results.hidden {
  display: none;
}

.search-result {
  cursor: pointer;
  padding: 10px 0px;
}
</style>
