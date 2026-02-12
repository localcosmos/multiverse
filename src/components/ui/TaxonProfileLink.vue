<script setup lang="ts">
import { computed } from 'vue';
import type { TaxonWithImage, TaxonWithSlugsAndImages, SearchTaxon } from 'localcosmos-client';
const props = defineProps<{
  taxon: TaxonWithImage | SearchTaxon | TaxonWithSlugsAndImages | TaxonWithImage;
  morphotype?: string | null;
}>();

let routeName = 'taxon-profile';

if (props.morphotype) {
  routeName = 'morphotype-profile';
}


type TaxonProfileRouteParams = {
  slug?: string;
  morphotype?: string;
  nameUuid?: string;
};

const routeParams = computed(() => {
  if (props.taxon.slug) {
    const routeParams: TaxonProfileRouteParams = {
      slug: props.taxon.slug,
    };
    if (props.morphotype) {
      routeParams['morphotype'] = props.morphotype;
    }
    return routeParams;
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