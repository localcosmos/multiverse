<script setup lang="ts">
import { computed } from 'vue';
import type { TaxonWithImage, TaxonWithSlugsAndImages, SearchTaxon } from 'localcosmos-client';
const props = defineProps<{
  taxon: TaxonWithImage | SearchTaxon | TaxonWithSlugsAndImages;
}>();

let routeName = 'taxon-profile';

const routeParams = computed(() => {
  if (props.taxon.slug) {
    return {
      slug: props.taxon.slug,
    };
  } else {
    return {
      nameUuid: props.taxon.nameUuid,
    };
  }
});

</script>

<template>
  <RouterLink :to="{ name: routeName, params: routeParams }">
    <slot />
  </RouterLink>
</template>