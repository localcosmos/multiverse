<script setup lang="ts">
import { t } from 'i18next';

const props = defineProps<{
  taxonLatname: string,
  taxonAuthor?: string|null,
  hideTaxonAuthor?: boolean,
}>();

let scientificName: string = props.taxonLatname;

if (props.taxonAuthor) {
  scientificName = `${props.taxonLatname} ${props.taxonAuthor}`;
}
const usedVernacularName:string = t(scientificName);
</script>

<template>
  <span>
    {{ usedVernacularName }}
  </span>
</template>