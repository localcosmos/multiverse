<script setup lang="ts">
import { ref, onMounted, inject } from 'vue';
import { PhMagnifyingGlass } from '@phosphor-icons/vue';
import ContentContainer from '@/components/container/ContentContainer.vue';
import type { LocalizedGlossary } from 'localcosmos-client';
import { Glossary } from 'localcosmos-client';
import { useLanguageStore } from '@/stores/language';

import LetterSelector from '@/components/ui/LetterSelector.vue';
import TabButton from '@/components/ui/tabs/TabButton.vue';

const glossary = inject('glossary') as Glossary | null;
const languageStore = useLanguageStore();

const localizedGlossary = ref<LocalizedGlossary|null>(null);

const termIdPrefix = 'id-term-';
const glossaryName = ref<string>('');
const searchActive = ref<boolean>(false);
const hasResults = ref<boolean>(false);

const getHeaderHeight = (): number => {
  const glossaryButtons = document.querySelector('.glossary-buttons') as HTMLElement | null;
  if (glossaryButtons) {
    const rect = glossaryButtons.getBoundingClientRect();
    return Math.round(rect.bottom);
  }
  return 0;
};

const loadGlossary = async () => {
  if (glossary) {
    glossaryName.value = glossary.glossaryFeature.name;
    try {
      // Use language from store
      localizedGlossary.value = await glossary.getLocalizedGlossary(languageStore.currentLanguage);
    } catch (error) {
      console.error('Error fetching localized glossary:', error);
    }
  } else {
    console.warn('Glossary not injected');
  }
};

function getScrollBehavior(): ScrollBehavior {
  return navigator.userAgent.match(/Android/i) ? 'auto' : 'smooth';
}

const jumpToTerm = async (searchText: string) => {
  if (glossary && searchText.length > 2) {
    const results = await glossary.searchLocalizedTerms(searchText, languageStore.currentLanguage);
    if (results.length > 0) {
      hasResults.value = true;
      searchActive.value = true;
      const bestResult = results[0];
      const id = `${termIdPrefix}${bestResult.term}`;
      const element = document.getElementById(id);

      if (element) {
        const headerOffset = getHeaderHeight();
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = Math.round(elementPosition + window.pageYOffset - headerOffset);

        window.scrollTo({
          top: offsetPosition,
          behavior: getScrollBehavior(),
        });
      }
    } else {
      hasResults.value = false;
      searchActive.value = true;
    }
  }
  else {
    hasResults.value = false;
    searchActive.value = false;
  }
};

const jumpToLetter = (letter: string) => {
  const id = `glossary-${letter}`;
  const element: HTMLElement | null = document.getElementById(id);

  if (element) {
    const headerOffset = getHeaderHeight();
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = Math.round(elementPosition + window.pageYOffset - headerOffset);

    window.scrollTo({
      top: offsetPosition,
      behavior: getScrollBehavior(),
    });
  }
};

const jumpToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: getScrollBehavior(),
  });
};

// Load glossary when component mounts
onMounted(loadGlossary);
</script>

<template>
  <ContentContainer>
    <div class="page">

      <div v-if="glossary && localizedGlossary">
        <div class="glossary-buttons bg-translucent-light">
          <div class="glossary-search">
            <TabButton
              :text="$t('glossary.Search')"
              :icon="PhMagnifyingGlass"
              :active="false"
              :search-mode="true"
              :no-results="!hasResults && searchActive"
              @update:search-text="jumpToTerm"
            />
          </div>
          <LetterSelector
            id="glossary-letter-selector"
            :letters="Object.keys(localizedGlossary).sort()"
            :slim="true"
            @select="jumpToLetter"
            @unselect="jumpToTop"
          />
        </div>
        <div class="container">
          <div class="page-padding">
            <div class="glossary-container">
              <div
                v-for="(terms, letter) in localizedGlossary"
                :key="letter"
                class="glossary-letter"
                :id="`glossary-${letter}`"
              >
                <div
                  v-for="(definition, term) in terms"
                  :key="term"
                  class="glossary-item"
                >
                  <div
                    :id="`${termIdPrefix}${term}`"
                    class="glossary-terms"
                  >
                    <div class="glossary-term">
                      {{ term }}
                    </div>
                    <div class="glossary-definition">
                      {{ definition.definition }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-else>
        <div class="container">
          {{ $t('glossary.NoGlossaryAvailable') }}
        </div>
      </div>
    </div>
  </ContentContainer>
</template>

<style scoped>
/* For smallest screens (mobile): term above definition */
.glossary-terms {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--size-md);
  padding: var(--size-md) 0;
}

.glossary-search {
  padding: 0 var(--size-md);
  display: flex;
  justify-content: flex-start;
  flex-direction: row;
  width: auto;
  align-self: flex-start;
}

.glossary-term {
  font-weight: bold;
}

.glossary-buttons {
  position: sticky;
  top: var(--header-bar-height); /* Adjust this value to match your header bar height */
  z-index: 10;
  padding-top: var(--size-md);
  padding-bottom: var(--size-md);
  backdrop-filter: var(--backdrop-filter-blur);
  display: flex;
  flex-direction: column;
  gap: var(--size-md);
}

.glossary-container {
  padding-bottom: 100vh;
}

/* For tablets and up: term next to definition */
@media (min-width: 640px) {
  .glossary-terms {
    grid-template-columns: 1fr 2fr;
    gap: 1rem;
    align-items: start;
  }
  
  .glossary-term {
    padding-right: 1rem;
  }
}

@media (min-width: 768px) {
  .glossary-terms {
    grid-template-columns: 1fr 3fr;
  }

  .glossary-buttons {
    top: 0px;
    margin-left: var(--navigation-rail-width);
  }

  .glossary-search {
    justify-content: center;
    align-self: center; /* <-- Add this line */
  }
}

@media (min-width: 1024px) {
  .glossary-terms {
    grid-template-columns: 1fr 4fr;
  }
}

@media (min-width: 1280px) {
  .glossary-terms {
    grid-template-columns: 1fr 5fr;
  }

  .glossary-buttons {
    top: var(--desktop-header-bar-height); /* Adjust this value for desktop header bar height */
    margin-left: 0
  }
}
</style>