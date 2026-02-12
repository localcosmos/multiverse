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

const nameUuid = ref<string|null>(null);

const morphotype = computed<string|null>(() => {
  const morphotypeParam = route.params.morphotype;
  if (typeof morphotypeParam === 'string') {
    return morphotypeParam;
  }
  return null;
});


if (route.params.nameUuid) {
  nameUuid.value = route.params.nameUuid as string;
} else {
  nameUuid.value = backboneTaxonomy.slugToNameUuid(slug);
}

if (nameUuid.value == null) {
  router.replace({ name: 'not-found' });
}

watch(
  () => route.params.nameUuid,
  async (newUuid, oldUuid) => {
    if (newUuid !== oldUuid) {
      componentKey.value = `${newUuid}`;
    }
  }
);

watch(
  () => route.params.slug,
  async (newSlug, oldSlug) => {
    if (newSlug !== oldSlug) {
      componentKey.value = `${newSlug}`;
      const newUuid = backboneTaxonomy.slugToNameUuid(newSlug as string);
      if (newUuid == null) {
        router.replace({ name: 'not-found' });
      } else {
        nameUuid.value = newUuid;
      }
    }
  }
);

watch(
  () => route.params.morphotype,
  async (newMorphotype, oldMorphotype) => {
    if (newMorphotype !== oldMorphotype) {
      componentKey.value = `${route.params.slug}-${newMorphotype}`;
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
      <TaxonProfileContent :key="componentKey" :nameUuid="nameUuid" :morphotype="morphotype"/>
    </ContentContainer>
  </Suspense>
</template>