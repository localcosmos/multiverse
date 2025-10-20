<script setup lang="ts">
/**
 * this component enables re-rendring of TaxonProfileContent if the user clicks on a related species.
 * the route name stays the same, only the param nameUuid chagens, which will not trigger a component
 * reload by default
 * see https://michaelnthiessen.com/force-re-render/
 * and https://router.vuejs.org/guide/essentials/dynamic-matching.html#reacting-to-params-changes
 */
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import TaxonProfilesContent from './TaxonProfilesContent.vue';

const route = useRoute();

let slug = route.params.slug as string;

if (!slug) {
  slug = 'start';
}

const componentKey = ref<string>(slug);

watch(
  () => route.params.slug,
  async (newSlug, oldSlug) => {
    if (!newSlug) {
      newSlug = 'start';
    }
    if (newSlug !== oldSlug) {
      componentKey.value = `${newSlug}`;
    }
  }
);
</script>

<template>
  <Suspense>
    <template #fallback>
      <div>loading</div>
    </template>
    <TaxonProfilesContent :key="componentKey" :slug="componentKey"/>
  </Suspense>
</template>