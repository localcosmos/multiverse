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
  <div class="dataset-card">
    <div class="dataset-card__image" :style="`background-image: url(${image});`">
    </div>
    <div class="dataset-card__footer">
      <div>
        <TaxonName
          v-if="taxon"
          :taxon-latname="taxon.taxonLatname"
          :taxon-author="taxon.taxonAuthor"
          :vernacular-name="vernacularName"
          :single-line="true"
        />
      </div>
      <div class="dataset-card__observation-date">
        {{ date?.toLocaleDateString() }}
      </div>
    </div>
  </div>
</template>

<style>
@layer defaults {
  :root {
    --dataset-card-bg: #FFF;
    --darkmode-dataset-card-bg: #000;
    --dataset-card__observation-date-color: rgb(150, 150, 150);
    --darkmode-dataset-card__observation-date-color: rgb(150, 150, 150);
  }
}

.dataset-card {
  box-shadow: var(--box-shadow);
  border-radius: var(--border-radius);
  width: 100%;
  background: var(--dataset-card-bg);
}

body.dark .dataset-card {
  background: var(--darkmode-dataset-card-bg);
}

.dataset-card__image {
  border-radius: var(--border-radius);
  aspect-ratio: 1/1;
  background-size: cover;
}

.dataset-card__footer {
  padding: var(--size-md)
}

.dataset-card__observation-date {
  color: var(--dataset-card__observation-date-color);
}
</style>
