<script setup lang="ts">
import { ref, inject } from 'vue';
import ContentContainer from '@/components/container/ContentContainer.vue';
import { t } from 'i18next';
import TabbedPage from '@/components/container/TabbedPage.vue';
import { PhMagnifyingGlass } from '@phosphor-icons/vue';

import type { Features, TaxonProfiles, SearchTaxon } from 'localcosmos-client';
import type { TabButtonDefinition } from '@/types/navigation';
import { TabButtonType } from '@/types/navigation';

import TaxonProfilesNavigation from '@/components/taxon-profiles/TaxonProfilesNavigation.vue';
import TaxonProfilesAlphabet from '@/components/taxon-profiles/TaxonProfilesAlphabet.vue';
import TaxonProfilesSearch from '@/components/taxon-profiles/TaxonProfilesSearch.vue';

const props = defineProps<{
  slug: string,
}>();

const taxonProfiles = inject('taxonProfiles') as TaxonProfiles;
const features = inject('features') as Features;

let nodeKey = 'start';

if (props.slug in taxonProfiles.navigationSlugs) {
  nodeKey = taxonProfiles.navigationSlugs[props.slug];
}

const tabButtons:TabButtonDefinition[] = [
  {
    text: t('taxonProfiles.Alphabet'),
    tabIndex: 2,
    type: TabButtonType.ALPHABET,
    letters: taxonProfiles.startLetters.vernacular,
  },
  {
    text: t('taxonProfiles.Search'),
    icon: PhMagnifyingGlass,
    tabIndex: 3,
    type: TabButtonType.SEARCH,
  }
];

let taxonProfilesNavigation = false;
if (features.TaxonProfiles.options && features.TaxonProfiles.options.enableTaxonomicNavigation) {
  taxonProfilesNavigation = true;
  const groupsButton =   {
    text: t('taxonProfiles.Groups'),
    tabIndex: 1,
    type: TabButtonType.STANDARD,
  };
  tabButtons.unshift(groupsButton);
}

const randomTaxa = ref<SearchTaxon[]>([]);

// Reactive variable to store the search text
const searchText = ref<string>('');
  const selectedLetter = ref<string|null>(null);

// Function to handle the search text emitted by TabbedPage
const handleSearchText = (text: string) => {
  searchText.value = text; // Update the search text
};

const handleSelectLetter = (letter: string) => {
  selectedLetter.value = letter;
};

const handleUnselectLetter = () => {
  selectedLetter.value = null;
};

const getNewRandomTaxa = () => {
  randomTaxa.value = taxonProfiles.getRandomTaxonProfiles(4, true);
};

</script>

<template>
  <ContentContainer>
    <div
      class="page"
      :class="nodeKey == 'start' ? 'header-padding-top page-padding-bottom' : 'page-padding-y'"
    >
      <div class="container">
        <TabbedPage
          v-if="nodeKey == 'start'"
          id="taxon-profiles"
          :tabs="tabButtons"
          :explode-on-large-screens="false"
          :show-nav-on-large-screens="true"
          @update:searchText="handleSearchText"
          @selectLetter="handleSelectLetter"
          @unselectLetter="handleUnselectLetter"
        >
          <template #tab1>
            <div v-if="taxonProfilesNavigation">
              <TaxonProfilesNavigation :node-key="nodeKey" />
            </div>
          </template>
          <template #tab2>
            <TaxonProfilesAlphabet
              class="letter-padding"
              :selected-letter="selectedLetter"
            />
          </template>
          <template #tab3>
            <div class="pt-m">
              <TaxonProfilesSearch
                class="page-padding-x"
                :search-text="searchText"
              />
            </div>
          </template>
        </TabbedPage>
        <div v-else>
          <TaxonProfilesNavigation
            v-if="taxonProfilesNavigation"
            :node-key="nodeKey"
          />
        </div>
      </div>
    </div>
  </ContentContainer>
</template>

<style scoped>
.letter-padding {
  padding-top: calc(var(--tabs-navigation-height) + var(--size-sm));
}

@media (min-width: 640px) {
}

@media (min-width: 768px) {
  .letter-padding {
    padding-top: calc(var(--desktop-tabs-navigation-height) + var(--size-xl));
  }
}

@media (min-width: 1024px) {

}

@media (min-width: 1280px) {
  .letter-padding {
    padding-top: calc(var(--desktop-tabs-navigation-height) + var(--size-xl));
  }
}

@media (min-width: 1536px) {
}
</style>