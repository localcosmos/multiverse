<script setup lang="ts">
/**
 * this component enables re-rendring of TaxonProfileContent if the user clicks on a related species.
 * the route name stays the same, only the param nameUuid chagens, which will not trigger a component
 * reload by default
 * see https://michaelnthiessen.com/force-re-render/
 * and https://router.vuejs.org/guide/essentials/dynamic-matching.html#reacting-to-params-changes
 */
import { ref, computed, watch, inject, type ComputedRef } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import TaxonProfileContent from './TaxonProfileContent.vue';
import type { BackboneTaxonomy } from 'localcosmos-client';
import ContentContainer from '@/components/container/ContentContainer.vue';

const backboneTaxonomy = inject('backboneTaxonomy') as BackboneTaxonomy;

const route = useRoute();
const router = useRouter();
const slug = route.params.slug as string;

const componentKey = ref<string>(`${slug}`);

const nameUuid: ComputedRef<string|null> = computed(() => {

  let uuid:string|null  = null;
  
  if (route.params.nameUuid) {
    uuid = route.params.nameUuid as string;
  } else {
    uuid = backboneTaxonomy.slugToNameUuid(slug);
  }
  
  return uuid;
});

if (nameUuid.value == null) {
  router.replace({ name: 'not-found' });
}

watch(
  () => route.params.nameUuid,
  async (newSlug, oldSlug) => {
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
    <ContentContainer>
      <TaxonProfileContent :key="componentKey" :nameUuid="nameUuid"/>
    </ContentContainer>
  </Suspense>
</template>