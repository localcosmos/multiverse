<script setup lang="ts">
import { ref } from 'vue';
import { t } from 'i18next';
import { useGeonames } from '@/composables/useGeonames';
import type { GeonameResult } from '@/types/geolocation';

const emit = defineEmits(['resultSelected']);

const geonameSearchResultBox = ref<HTMLElement>();
const geonameSearchInput = ref<HTMLInputElement>();

// Use the composable
const { results, loading, error, searchGeonames } = useGeonames();

const searchGeoname = async (event: Event) => {
  const searchText = (event.target as HTMLInputElement).value;

  if (searchText.length < 3 && geonameSearchResultBox.value) {
    geonameSearchResultBox.value.classList.add('hidden');
    results.value = [];
  } else {
    if (geonameSearchResultBox.value) {
      geonameSearchResultBox.value.classList.remove('hidden');
    }
    await searchGeonames(searchText);
  }
};

const clearSearch = () => {
  if (geonameSearchInput.value) {
    geonameSearchInput.value.value = '';
  }
  if (geonameSearchResultBox.value) {
    geonameSearchResultBox.value.classList.add('hidden');
  }
};

const selectGeoname = (result: GeonameResult) => {
  emit('resultSelected', result);
  clearSearch();
};

const onBlur = () => {
  setTimeout(clearSearch, 1000);
};

</script>

<template>
  <div class="geoname-search-container">
    <div class="form-field-input geoname-search-input">
      <input
        id="geoname-search"
        ref="geonameSearchInput"
        type="text"
        :placeholder="t('search.searchGeoname').toString()"
        @keyup="searchGeoname"
        @blur="onBlur"
      >
      <label for="geoname-search">
        {{ $t('search.searchGeoname') }}
      </label>
    </div>
    <div
      ref="geonameSearchResultBox"
      class="geoname-search-results hidden"
    >
      <div v-if="loading">
        {{ $t('search.loading') || 'Loading...' }}
      </div>
      <div v-else-if="results.length">
        <div
          v-for="(result, index) in results"
          :key="index"
          class="search-result"
          @click="selectGeoname(result)"
        >
          <span>
            {{ result.name }}
            <template v-if="result.adminName1">, {{ result.adminName1 }}</template>
            <template v-if="result.adminName2">, {{ result.adminName2 }}</template>
            , {{ result.country }}
          </span>
        </div>
      </div>
      <div v-else class="no-results">
        {{ $t('search.noResults') }}
      </div>
      <div v-if="error" class="error">
        {{ error }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.geoname-search-container {
  position: relative;
  width: 80%;
}

.geoname-search-input {
  width: 220px;
}

@media (min-width: 640px) {
  .geoname-search-input {
    width: 250px;
  }
}

@media (min-width: 768px) {
}

@media (min-width: 1024px) {

}

@media (min-width: 1280px) {

}

@media (min-width: 1536px) {

}
</style>
