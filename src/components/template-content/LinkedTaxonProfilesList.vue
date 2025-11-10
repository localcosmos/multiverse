<script setup lang="ts">
import type { TaxonWithImage } from 'localcosmos-client';
import ImageCard from '@/components/ui/ImageCard.vue';
import TaxonName from '@/components/ui/TaxonName.vue';
import TaxonProfileLink from '../ui/TaxonProfileLink.vue';

const props = defineProps<{
  linkedTaxonProfiles: TaxonWithImage[]
}>();

</script>

<template>
  <div>
    <div
      v-for="taxon in linkedTaxonProfiles"
      :key="taxon.nameUuid"
      class="taxon-profiles-list mb-4"
    >
      <TaxonProfileLink
          :taxon="taxon"
          class="nolinkstyle"
        >
          <ImageCard :image="taxon.image">
            <TaxonName
              :taxon-latname="taxon.taxonLatname"
              :taxon-author="taxon.taxonAuthor"
              :hide-taxon-author="true"
            >
            </TaxonName>
          </ImageCard>
        </TaxonProfileLink>
    </div>
  </div>
</template>

<style scoped>
.taxon-profiles-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--size-md);
  row-gap: var(--size-lg);
}

@media (min-width: 400px) {
  .taxon-profiles-list {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 640px) {
  .taxon-profiles-list {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 768px) {
  .taxon-profiles-list {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (min-width: 1024px) {
  .taxon-profiles-list {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (min-width: 1280px) {
  .taxon-profiles-list {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (min-width: 1536px) {
}
</style>