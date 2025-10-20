<script setup lang="ts">
import { inject } from 'vue';
import type { BackboneTaxonomy, TaxonType } from 'localcosmos-client';
import TaxonName from '../ui/TaxonName.vue';

const backbonetaxonomy = inject('backboneTaxonomy') as BackboneTaxonomy;

const props = defineProps<{
  uuid: string,
  taxon: TaxonType | null,
  image: string,
  date: Date | null,
  username?: string | null,
}>();

let vernacularName: string | null = null;

if (props.taxon) {
  vernacularName = backbonetaxonomy.vernacular(props.taxon.nameUuid);
}

</script>

<template>
  <div class="dataset-card bg-solid">
    <div class="dataset-image" :style="`background-image: url(${image});`">
    </div>
    <div class="dataset-card-footer">
      <div>
        <TaxonName
          v-if="taxon"
          :taxon-latname="taxon.taxonLatname"
          :taxon-author="taxon.taxonAuthor"
          :vernacular-name="vernacularName"
          :single-line="true"
        />
      </div>
      <div class="observation-date">
        {{ date?.toLocaleDateString() }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.dataset-card {
  box-shadow: var(--box-shadow);
  border-radius: var(--border-radius);
  width: 100%;
}

.dataset-image {
  border-radius: var(--border-radius);
  aspect-ratio: 1/1;
  background-size: cover;
}

.dataset-card-footer {
  padding: var(--size-md)
}

.observation-date {
  color: var(--color-grey);
}
</style>