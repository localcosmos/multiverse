<script setup lang="ts">
import { ref, inject, computed } from "vue";
import { useTabsStore } from "@/stores/tabs";
import { useLetterSelectorStore } from "@/stores/letter-selector";
import { t } from "i18next";
import TabbedPage from "@/components/container/TabbedPage.vue";
import { PhMagnifyingGlass } from "@phosphor-icons/vue";

import type { Features, TaxonProfiles, SearchTaxon } from "localcosmos-client";
import type { TabButtonDefinition } from "@/types/navigation";
import { TabButtonType } from "@/types/navigation";

import GradientContainer from "@/components/container/GradientContainer.vue";
import { useAppSettingsStore } from "@/stores/app-settings";

const appSettings = useAppSettingsStore();
import TaxonProfilesNavigation from "@/components/taxon-profiles/TaxonProfilesNavigation.vue";
import TaxonProfilesAlphabet from "@/components/taxon-profiles/TaxonProfilesAlphabet.vue";
import TaxonProfilesSearch from "@/components/taxon-profiles/TaxonProfilesSearch.vue";

const props = defineProps<{
  slug: string;
}>();

const taxonProfiles = inject("taxonProfiles") as TaxonProfiles;
const features = inject("features") as Features;

let nodeKey = "start";

if (props.slug in taxonProfiles.navigationSlugs) {
  nodeKey = taxonProfiles.navigationSlugs[props.slug];
}

const tabButtons: TabButtonDefinition[] = [
  {
    text: t("taxonProfiles.Alphabet"),
    tabIndex: 2,
    type: TabButtonType.ALPHABET,
    letters: taxonProfiles.startLetters.vernacular,
  },
  {
    text: t("taxonProfiles.Search"),
    icon: PhMagnifyingGlass,
    tabIndex: 3,
    type: TabButtonType.SEARCH,
  },
];

let taxonProfilesNavigation = false;
if (
  features.TaxonProfiles.options &&
  features.TaxonProfiles.options.enableTaxonomicNavigation
) {
  taxonProfilesNavigation = true;
  const groupsButton = {
    text: t("taxonProfiles.Groups"),
    tabIndex: 1,
    type: TabButtonType.STANDARD,
  };
  tabButtons.unshift(groupsButton);
}

const tabsStore = useTabsStore();
const letterSelectorStore = useLetterSelectorStore();

if (nodeKey === "start") {
  letterSelectorStore.registerLetterSelector("taxon-profiles");
}

const selectedLetter = computed(
  () => letterSelectorStore.letters["taxon-profiles"]?.selectedLetter ?? null,
);
const searchText = computed(
  () => tabsStore.tabs["taxon-profiles"]?.searchText ?? "",
);

const randomTaxa = ref<SearchTaxon[]>([]);

const getNewRandomTaxa = () => {
  randomTaxa.value = taxonProfiles.getRandomTaxonProfiles(4, true);
};
</script>

<template>
  <GradientContainer :gradient-type="appSettings.isDark ? 'dark' : 'light'">
    <div
      class="taxon-profiles-content page"
      :class="nodeKey == 'start' ? 'subheader-padding-top' : 'page-padding-top'"
    >
      <div class="container page-padding-bottom">
        <TabbedPage
          v-if="nodeKey == 'start'"
          id="taxon-profiles"
          :tabs="tabButtons"
          :initial-tab="taxonProfilesNavigation ? 1 : 2"
          :explode-on-large-screens="false"
          :show-nav-on-large-screens="true"
        >
          <template #tab1>
            <div v-if="taxonProfilesNavigation">
              <TaxonProfilesNavigation
                :node-key="nodeKey"
                class="padding-top-xl"
              />
            </div>
          </template>
          <template #tab2>
            <TaxonProfilesAlphabet
              class="taxon-profiles-content__letter-padding"
              :selected-letter="selectedLetter"
            />
          </template>
          <template #tab3>
            <div class="pt-m">
              <TaxonProfilesSearch
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
  </GradientContainer>
</template>

<style>
@layer defaults {
  :root {
    --taxon-profiles-content-bg: #FFF;
    --taxon-profiles-content-text-color: #000;
    --taxon-profiles-content-box-shadow: #fff;

    --darkmode-taxon-profiles-content-bg: #000;
    --darkmode-taxon-profiles-content-text-color: #FFF;
    --darkmode-taxon-profiles-content-box-shadow: 0 0 60px 40px #000;
  }
}

.taxon-profiles-content {
  background: var(--taxon-profiles-content-bg);
  color: var(--taxon-profiles-content-text-color);
  box-shadow: var(--taxon-profiles-content-box-shadow);
}

body.dark .taxon-profiles-content {
  background: var(--darkmode-taxon-profiles-content-bg);
  color: var(--darkmode-taxon-profiles-content-text-color);
  box-shadow: var(--darkmode-taxon-profiles-content-box-shadow);
}

.taxon-profiles-content__letter-padding {
  padding-top: calc(var(--header-bar-height) + var(--size-xl));
}

@media (min-width: 640px) {
}

@media (min-width: 768px) {
  .taxon-profiles-content__letter-padding {
    padding-top: calc(var(--desktop-tabs-navigation-height) + var(--size-xl));
  }
}

@media (min-width: 1024px) {
}

@media (min-width: 1280px) {
  .taxon-profiles-content__letter-padding {
    padding-top: calc(var(--desktop-tabs-navigation-height) + var(--size-xl));
  }
}

@media (min-width: 1536px) {
}
</style>
