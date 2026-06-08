<script setup lang="ts">
import { ref, inject, onMounted } from 'vue';
import type { TaxonProfiles, TaxonWithImage, SearchTaxon } from 'localcosmos-client';
import ImageCard from '@/components/ui/ImageCard.vue';
import VernacularName from './text/VernacularName.vue';
import TaxonName from './ui/TaxonName.vue';
import { getTodaysHero } from '@/composables/getTodaysHero';

import TaxonProfileLink from './ui/TaxonProfileLink.vue';
import HeroCard from './ui/HeroCard.vue';

import LoadingSpinner from './ui/LoadingSpinner.vue';

const taxonProfiles = inject('taxonProfiles') as TaxonProfiles;
const todaysHero = ref<TaxonWithImage|null>(null);
const randomTaxa = ref<SearchTaxon[]>([]);
const loading = ref<boolean>(true);

onMounted(async()=>{
  const hero:TaxonWithImage|null = await getTodaysHero();
  if (hero) {
    todaysHero.value = hero;
  }

  randomTaxa.value = taxonProfiles.getRandomTaxonProfiles();

  loading.value = false;
});
</script>

<template>
  <div class="min-h-full page-padding container">
    <div v-if="loading">
      <LoadingSpinner />
    </div>
    <div v-else class="margin-bottom">
      <div>
        <h1 class="mb-lg">{{ $t("Today's Wonder") }}</h1>
      </div>
      <div
        v-if="todaysHero"
        class="hero"
      >
        <TaxonProfileLink :taxon="todaysHero" class="nolinkstyle">
          <HeroCard :image="todaysHero.image" :show-caption="false">
            <template #title>
              <div class="text-center mb-lg">
                <h2>
                  <VernacularName
                    :taxon-latname="todaysHero.taxonLatname"
                    :taxon-author="todaysHero.taxonAuthor"
                    :hide-taxon-author="true"
                  />
                </h2>
                <div class="text-muted font-narrow">
                  <i>{{ todaysHero.taxonLatname }}</i>
                </div>
              </div>
            </template>
            <div v-if="todaysHero.shortProfile" class="text-justify">
              <div v-html="todaysHero.shortProfile" class="pt-m" />
            </div>
          </HeroCard>
        </TaxonProfileLink>
      </div>
      <div
        v-if="randomTaxa.length"
        class="mt-2xl"
      >
        <div class="mb-lg">
          <h1>{{ $t('Have you heard of it?') }}</h1>
        </div>
        <div class="random-taxa">
          <div
            v-for="(taxon, counter) in randomTaxa"
            :key="counter"
          >
            <TaxonProfileLink
              :taxon="taxon"
              class="nolinkstyle"
            >
              <ImageCard :image="taxon.image" :show-caption="false">
                <TaxonName
                  :taxon-latname="taxon.taxonLatname"
                  :taxon-author="taxon.taxonAuthor"
                  :hide-taxon-author="true"
                  :narrow="true"
                >
                </TaxonName>
              </ImageCard>
            </TaxonProfileLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.hero {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}

.hero > div, .hero > a {
  display: block;
  max-width: 400px;
}

.random-taxa {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--gap-medium);
}

@media (min-width: 640px) {
}

@media (min-width: 768px) {
  .random-taxa {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (min-width: 1024px) {

}

@media (min-width: 1280px) {

}

@media (min-width: 1536px) {

}
</style>