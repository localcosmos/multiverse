<script setup lang="ts">
import type { TaxonWithImage } from "localcosmos-client";
import type { SimpleEntry } from "./TaxonRelationships.vue";

import TaxonProfileLink from "@/components/ui/TaxonProfileLink.vue";
import ImageCard from "@/components/ui/ImageCard.vue";
import TaxonName from "@/components/ui/TaxonName.vue";
import GlossarizedText from "@/components/text/GlossarizedText.vue";

defineProps<{
  contextTaxon: TaxonWithImage;
  simpleEntry: SimpleEntry;
}>();
</script>

<template>
  <div class="taxon-relationships__simple-entries">
    <ImageCard :image="contextTaxon.image" class="nolinkstyle">
      <template #no-image>
        <div class="rel-card-no-image">
          <i>{{ contextTaxon.taxonLatname }}</i>
        </div>
      </template>
      <TaxonName
        :taxon-latname="contextTaxon.taxonLatname"
        :taxon-author="contextTaxon.taxonAuthor"
      />
    </ImageCard>
    <TaxonProfileLink
      v-for="rel in simpleEntry.relationships"
      :key="rel.relatedTaxon.nameUuid"
      :taxon="rel.relatedTaxon"
      class="nolinkstyle"
    >
      <ImageCard :image="rel.relatedTaxon.image">
        <template #no-image>
          <div class="rel-card-no-image">
            <i>{{ rel.relatedTaxon.taxonLatname }}</i>
          </div>
        </template>
        <TaxonName
          :taxon-latname="rel.relatedTaxon.taxonLatname"
          :taxon-author="rel.relatedTaxon.taxonAuthor"
        />
        <div v-if="rel.description" class="font-size-md relationship-description">
          <GlossarizedText :htmlText="rel.description" />
        </div>
      </ImageCard>
    </TaxonProfileLink>
  </div>
</template>

<style>
.taxon-relationships__simple-entries {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: var(--size-xl);
}

@media (min-width: 640px) {
  .taxon-relationships__simple-entries {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .taxon-relationships__simple-entries {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
