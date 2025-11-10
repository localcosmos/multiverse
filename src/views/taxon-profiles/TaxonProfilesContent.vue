<script setup lang="ts">
import { ref, inject } from 'vue';
import ContentContainer from '@/components/container/ContentContainer.vue';
import { t } from 'i18next';
import TabbedPage from '@/components/container/TabbedPage.vue';
import { PhMagnifyingGlass } from '@phosphor-icons/vue';

import type { Features, TaxonProfiles, SearchTaxon } from 'localcosmos-client';
import type { TabButtonDefinition } from '@/types/navigation';

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
    tabIndex: 1,
  },
  {
    text: t('taxonProfiles.Search'),
    icon: PhMagnifyingGlass,
    tabIndex: 2,
    searchMode: true,
  }
];

let taxonProfilesNavigation = false;
if (features.TaxonProfiles.options && features.TaxonProfiles.options.enableTaxonomicNavigation) {
  taxonProfilesNavigation = true;
  const groupsButton =   {
    text: t('taxonProfiles.Groups'),
    tabIndex: 0,
  };
  tabButtons.unshift(groupsButton);
}

const randomTaxa = ref<SearchTaxon[]>([]);

// Reactive variable to store the search text
const searchText = ref<string>('');

// Function to handle the search text emitted by TabbedPage
const handleSearchText = (text: string) => {
  searchText.value = text; // Update the search text
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
        >
          <template #tab1>
            <div v-if="taxonProfilesNavigation">
              <TaxonProfilesNavigation :node-key="nodeKey" />
            </div>
          </template>
          <template #tab2>
            <div>
              <TaxonProfilesAlphabet />
            </div>
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
</style>