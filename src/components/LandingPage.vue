<script setup lang="ts">
import { ref, inject, onMounted } from 'vue';
import type { TaxonProfiles, TaxonWithImage, SearchTaxon, ImageWithTextAndLicence, LocalCosmosApi } from 'localcosmos-client';
import { LCApiResultTypes } from 'localcosmos-client';
import type { IncidentReport } from '@/types/template-content';
import type { TemplateContentSource } from '@/composables/useTemplateContent';
import ImageCard from '@/components/ui/ImageCard.vue';
import TaxonName from './ui/TaxonName.vue';
import { getTodaysHero } from '@/composables/getTodaysHero';

import TaxonProfileLink from './ui/TaxonProfileLink.vue';
import HeroPoster from './ui/HeroPoster.vue';
import IncidentReportDisplay from './template-content/IncidentReportDisplay.vue';

import LoadingSpinner from './ui/LoadingSpinner.vue';
import { useTemplateContent } from '@/composables/useTemplateContent.js';
import SponsorStripe from '@/components/template-content/SponsorStripe.vue';

const taxonProfiles = inject('taxonProfiles') as TaxonProfiles;
const LCApi = inject('LCApi') as LocalCosmosApi;
const todaysHero = ref<TaxonWithImage|null>(null);
const randomTaxa = ref<SearchTaxon[]>([]);
const incidentReport = ref<IncidentReport|null>(null);
const incidentDate = ref<string|null>(null);
const incidentReportSource = ref<TemplateContentSource|null>(null);
const loading = ref<boolean>(true);

const templateContentAPI = useTemplateContent();

onMounted(async () => {
  const hero: TaxonWithImage | null = await getTodaysHero();
  if (hero) {
    todaysHero.value = hero;
  }

  randomTaxa.value = taxonProfiles.getRandomTaxonProfiles();

  const incidentReportResponse = await LCApi.getTemplateContentSlugsByAssignment('incident-report');

  if (incidentReportResponse.type === LCApiResultTypes.success && incidentReportResponse.data && incidentReportResponse.data.slugs.length > 0) {
    const slug = incidentReportResponse.data.slugs[0];
    const remoteContent = await templateContentAPI.fetchRemoteTemplateContent(slug);

    if (remoteContent.templateData) {
      const { title, contents, publishedAt } = remoteContent.templateData;
      incidentReport.value = {
        templateName: 'IncidentReport',
        heading: title,
        text: (contents.text as string) ?? undefined,
        image: (contents.image as ImageWithTextAndLicence) ?? undefined,
      };
      incidentDate.value = publishedAt ? new Date(publishedAt).toLocaleDateString() : null;
      incidentReportSource.value = remoteContent.source;
    }
  }

  loading.value = false;
});
</script>

<template>
  <div class="min-h-100">
    <div v-if="loading" class="page-padding container">
      <div class="centered-spinner">
          <LoadingSpinner />
      </div>
    </div>
    <div v-else>
      <div v-if="todaysHero" class="hero-container">
        <div class="hero-left"></div>
        <HeroPoster :hero="todaysHero" />
        <div class="hero-right"></div>
      </div>
      <SponsorStripe />
      <div class="rail-padding">
        <IncidentReportDisplay
          v-if="incidentReport"
          :heading="incidentReport.heading"
          :text="incidentReport.text"
          :date="incidentDate"
          :image="incidentReport.image"
          :template-source="incidentReportSource"
        />
      </div>

      <div class="random-taxa-stripe">
        <div class="page-padding container">
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
                      :single-line="true"
                    >
                    </TaxonName>
                  </ImageCard>
                </TaxonProfileLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@layer defaults {
  :global(:root) {
    --landing-page-random-taxa-bg: rgba(255, 255, 255, 0.84);
    --hero-left-bg: var(--bg-gradient-left);
    --hero-right-bg: var(--bg-gradient-right);
    --hero-container-bg: none;

    --darkmode-landing-page-random-taxa-bg: rgba(0, 0, 0, 0.84);
    --darkmode-hero-left-bg: var(--darkmode-bg-gradient-left);
    --darkmode-hero-right-bg: var(--darkmode-bg-gradient-right);
    --darkmode-hero-container-bg: none;
  }
}

.hero-container {
  background: var(--hero-container-bg);
}

body.dark .hero-container {
  background: var(--darkmode-hero-container-bg);
}

.random-taxa-stripe {
  background: var(--landing-page-random-taxa-bg);
}

body.dark .random-taxa-stripe {
  background: var(--darkmode-landing-page-random-taxa-bg);
}

.centered-spinner {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

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

.hero-left,
.hero-right {
  display: none;
}

.random-taxa {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--gap-medium);
}

.random-taxa > div {
  width: calc((100vw - var(--gap-medium) - (var(--size-xl) * 2)) / 2);
}

@media (min-width: 640px) {
}

@media (min-width: 768px) {
  .random-taxa {
    grid-template-columns: repeat(4, 1fr);
  }

  .random-taxa > div {
    width: calc(
      (100vw - ((var(--gap-medium) * 3) + (var(--size-xl) * 2)) - var(--navigation-rail-width)) / 4
    );
  }
}

@media (min-width: 1024px) {
}

@media (min-width: 1280px) {
  .hero-container {
    display: flex;
    align-items: stretch;
    width: 100%;
  }

  .hero-left,
  .hero-right {
    display: block;
    flex: 1 1 auto;
    pointer-events: none;
  }

  .hero-left {
    background: var(--hero-left-bg);
  }

  body.dark .hero-left {
    background: var(--darkmode-hero-left-bg);
  }

  .hero-right {
    background: var(--hero-right-bg);
  }
  body.dark .hero-right {
    background: var(--darkmode-hero-right-bg);
  }

  .hero-container :deep(.hero-poster) {
    margin-left: 0;
    margin-right: 0;
  }

  .random-taxa > div {
    width: calc((1280px - ((var(--gap-medium) * 3) + (var(--size-xl) * 2))) / 4);
  }
}

@media (min-width: 1536px) {

}
</style>
