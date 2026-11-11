<script setup lang="ts">
import { inject } from 'vue';
import GradientContainer from '@/components/container/GradientContainer.vue';
import ImageCard from '@/components/ui/ImageCard.vue';
import TaxonName from '@/components/ui/TaxonName.vue';
import TaxonProfileLink from '@/components/ui/TaxonProfileLink.vue';
import SponsorStripe from '@/components/template-content/SponsorStripe.vue';
import { useExhibitionModeStore } from '@/stores/exhibition-mode';
import { useAppSettingsStore } from '@/stores/app-settings';
import type { TaxonProfiles } from 'localcosmos-client';

const exhibitionStore = useExhibitionModeStore();
const appSettings = useAppSettingsStore();
const taxonProfiles = inject('taxonProfiles') as TaxonProfiles;
</script>

<template>
  <div class="min-h-100 exhibition-page">
    <GradientContainer :gradient-type="appSettings.isDark ? 'dark' : 'light'" class="exhibition-gradient">
      <div class="container exhibition-view page-padding-bottom">
        <h1 v-if="exhibitionStore.title" class="exhibition-view__title page-padding-x pt-xl">
          {{ exhibitionStore.title }}
        </h1>
        <div v-if="exhibitionStore.species.length > 0" class="exhibition-grid page-padding-x pt-xl">
          <TaxonProfileLink
            v-for="entry in exhibitionStore.species"
            :key="entry.nameUuid"
            :taxon="entry"
            class="nolinkstyle"
          >
            <ImageCard :image="entry.image">
              <TaxonName
                :taxon-latname="entry.taxonLatname"
                :taxon-author="entry.taxonAuthor"
                :vernacular-name="entry.name"
              />
              <p
                v-if="taxonProfiles.getRegisteredTaxon(entry.nameUuid)?.shortProfile"
                class="exhibition-card__short-profile"
              >
                {{ taxonProfiles.getRegisteredTaxon(entry.nameUuid)?.shortProfile }}
              </p>
              <template #no-image>
                <div class="exhibition-card__no-image">
                  <i>{{ entry.taxonLatname }}</i>
                </div>
              </template>
            </ImageCard>
          </TaxonProfileLink>
        </div>

        <div v-else class="exhibition-empty page-padding-x pt-xl">
          <p class="exhibition-empty__text">{{ $t('exhibitionMode.noSpeciesConfigured') }}</p>
        </div>
      </div>
    </GradientContainer>
    <SponsorStripe />
  </div>
</template>

<style scoped>
.exhibition-page {
  display: flex;
  flex-direction: column;
}

/* stretch gradient container to push stripe to the bottom */
.exhibition-page :deep(.gradient-container) {
  flex: 1;
}

.exhibition-view {
  min-height: 0;
}

.exhibition-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--size-sm);
  align-items: stretch;
}

/* make the RouterLink and ImageCard fill the full grid cell height */
.exhibition-grid > a,
.exhibition-grid > div {
  display: flex;
  flex-direction: column;
}

.exhibition-grid > a :deep(.image-card),
.exhibition-grid > div :deep(.image-card) {
  flex: 1;
}

.exhibition-card__short-profile {
  font-size: var(--font-size-md, 0.85rem);
  line-height: 1.4;
  opacity: 0.8;
  margin: var(--size-xs) 0 0 0;
}

.exhibition-card__no-image {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  aspect-ratio: 4/3;
  opacity: 0.5;
}

.exhibition-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 40vh;
}

.exhibition-empty__text {
  opacity: 0.5;
  font-size: 1.1rem;
  text-align: center;
}

@media (min-width: 768px) {
  .exhibition-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 1024px) {
  .exhibition-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
</style>
