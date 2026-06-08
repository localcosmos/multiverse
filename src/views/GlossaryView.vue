<script setup lang="ts">
import { ref, onMounted, inject, computed, watch, markRaw } from 'vue';
import { PhMagnifyingGlass } from '@phosphor-icons/vue';
import ContentContainer from '@/components/container/ContentContainer.vue';
import type { LocalizedGlossary } from 'localcosmos-client';
import { Glossary } from 'localcosmos-client';
import { useLanguageStore } from '@/stores/language';
import { useLetterSelectorStore } from '@/stores/letter-selector';
import { useTabsStore } from '@/stores/tabs';
import type { TabButtonDefinition } from '@/types/navigation';
import { t } from 'i18next';

import { TabButtonType } from '@/types/navigation';

import TabbedPage from '@/components/container/TabbedPage.vue';
import TermsList from '@/components/glossary/TermsList.vue';

const glossary = inject('glossary') as Glossary | null;
const languageStore = useLanguageStore();
const letterSelectorStore = useLetterSelectorStore();
const tabsStore = useTabsStore();

const localizedGlossary = ref<LocalizedGlossary|null>(null);
const startLetterGlossary = ref<LocalizedGlossary|null>(null);
const searchGlossary = ref<LocalizedGlossary|null>(null);

const termIdPrefix = 'id-term-';
const glossaryName = ref<string>('');

const searched = ref<boolean>(false);

const availableStartLetters = ref<string[]>([]);

const tabButtons = ref<TabButtonDefinition[]>([]);

const selectedLetter = computed(() => letterSelectorStore.letters['GlossaryTabs']?.selectedLetter ?? null);
const searchText = computed(() => tabsStore.tabs['GlossaryTabs']?.searchText ?? '');

const loadGlossary = async () => {
  if (glossary) {
    glossaryName.value = glossary.glossaryFeature.name;
    try {
      // Use language from store
      localizedGlossary.value = await glossary.getLocalizedGlossary(languageStore.currentLanguage);
      startLetterGlossary.value = localizedGlossary.value;
      if (localizedGlossary.value) {
        availableStartLetters.value = Object.keys(localizedGlossary.value).sort();

        tabButtons.value = [{
            tabIndex: 1,
            text: t('taxonProfiles.Alphabet'),
            type: TabButtonType.ALPHABET,
            letters: availableStartLetters.value,
          },
          {
            text: t('taxonProfiles.Search'),
            icon: markRaw(PhMagnifyingGlass),
            tabIndex: 2,
            type: TabButtonType.SEARCH,
          },

        ];
      }
    } catch (error) {
      console.error('Error fetching localized glossary:', error);
    }
  } else {
    console.warn('Glossary not injected');
  }
};

// Watch for selected letter changes
watch(selectedLetter, (letter) => {
  if (letter && localizedGlossary.value && letter in localizedGlossary.value) {
    startLetterGlossary.value = {
      [letter]: localizedGlossary.value[letter],
    };
  } else if (!letter) {
    startLetterGlossary.value = localizedGlossary.value;
  }
});

// Watch for search text changes
watch(searchText, (text) => {
  if (!text) {
    // if search text is empty, reset search glossary
    searchGlossary.value = null;
    searched.value = false;
    return;
  }

  if (localizedGlossary.value) {
    const searchTerm = text.toLowerCase();
    const filteredGlossary: LocalizedGlossary = {};

    for (const [letter, terms] of Object.entries(localizedGlossary.value)) {
      for (const [term, definition] of Object.entries(terms)) {
        const termLower = term.toLowerCase();
        const synonymsLower = definition.synonyms ? definition.synonyms.map(s => s.toLowerCase()) : [];

        if (termLower.startsWith(searchTerm) || synonymsLower.some(syn => syn.startsWith(searchTerm))) {

          if (!filteredGlossary[letter]) {
            filteredGlossary[letter] = {};
          }
          filteredGlossary[letter][term] = definition;
        }
      }
    }

    searchGlossary.value = filteredGlossary;
    searched.value = true;
  }
});

// Load glossary when component mounts
onMounted(() => {
  letterSelectorStore.registerLetterSelector('GlossaryTabs');
  loadGlossary();
});
</script>

<template>
  <ContentContainer>
    <div class="page subheader-padding-top">
      <div class="container">
        <TabbedPage
          id="GlossaryTabs"
          :tabs="tabButtons"
          :explode-on-large-screens="false"
          :show-nav-on-large-screens="true"
        >
          <template #tab1>
            <div v-if="glossary && localizedGlossary">
              <div class="letter-padding page-padding-x page-padding-bottom">
                <TermsList
                  :localized-glossary="startLetterGlossary!"
                  :term-id-prefix="termIdPrefix"
                />
              </div>
            </div>
            <div v-else class="page-padding-x">
              {{ $t('glossary.NoGlossaryAvailable') }}
            </div>
          </template>
          <template #tab2>
            <div class="page-padding-x">
              <div v-if="searched">
                <TermsList
                  v-if="glossary && searchGlossary"
                  :localized-glossary="searchGlossary!"
                  term-id-prefix="id-term-search-"
                />
                <div v-else class="page-padding-x page-padding-bottom">
                  {{ $t('glossary.NoSearchResults') }}
                </div>
              </div>
            </div>
          </template>
        </TabbedPage>
      </div>
    </div>
  </ContentContainer>
</template>

<style scoped>
.letter-padding {
  padding-top: calc(var(--tabs-navigation-height) + var(--size-sm));
}
</style>