<script setup lang="ts">
import { computed } from 'vue';
import type { TaxonRelationship } from 'localcosmos-client';

import RelatedTaxaCard from './RelatedTaxaCard.vue';

import ImageCard from "@/components/ui/ImageCard.vue";
import TaxonName from "@/components/ui/TaxonName.vue";
import GlossarizedText from "@/components/text/GlossarizedText.vue";
import TaxonProfileLink from "@/components/ui/TaxonProfileLink.vue";

const props = defineProps<{
  relationships: TaxonRelationship[];
  roleName: string;
  taxonKey?: 'taxon' | 'relatedTaxon';
}>();

const resolvedKey = computed(() => props.taxonKey ?? 'taxon');
</script>

<template>
  <RelatedTaxaCard :role-name="roleName">
    <div class="related-taxa-list">
      <TaxonProfileLink
        v-for="rel in relationships"
        :key="rel[resolvedKey].nameUuid"
        :taxon="rel[resolvedKey]"
        class="nolinkstyle"
      >
        <ImageCard :image="rel[resolvedKey].image" :horizontal-on-mobile="true">
          <template #no-image>
            <div class="rel-card-no-image">
              <i>{{ rel[resolvedKey].taxonLatname }}</i>
            </div>
          </template>
          <TaxonName
            :taxon-latname="rel[resolvedKey].taxonLatname"
            :taxon-author="rel[resolvedKey].taxonAuthor"
            :hide-scientific-name="true"
          />
          <div v-if="rel.description" class="font-size-md relationship-description">
            <GlossarizedText :htmlText="rel.description" />
          </div>
        </ImageCard>
      </TaxonProfileLink>
    </div>
  </RelatedTaxaCard>
</template>

<style>

.related-taxa-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--size-md);
}

.related-taxa-list > * {
  flex: 0 0 100%;
}

@media (min-width: 640px) {
  .related-taxa-list > * {
    flex: 0 0 calc(50% - var(--size-md) / 2);
  }
}

@media (min-width: 768px) {
}

@media (min-width: 1024px) {
  .related-taxa-list > * {
    flex: 0 0 calc(33.333% - var(--size-md) * 2 / 3);
  }
}

@media (min-width: 1280px) {
  .related-taxa-list > * {
    flex: 0 0 calc(25% - var(--size-md) * 3 / 4);
  }
}

@media (min-width: 1536px) {
}
</style>