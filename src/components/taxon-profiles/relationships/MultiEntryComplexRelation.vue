<script setup lang="ts">
import { computed } from 'vue';
import type { TaxonWithImage } from 'localcosmos-client';
import type { ComplexEntry } from './TaxonRelationships.vue';

import { PhArrowFatDown, PhArrowFatRight } from '@phosphor-icons/vue';
import RelatedTaxaCard from './RelatedTaxaCard.vue';
import RelatedTaxaList from './RelatedTaxaList.vue';
import ImageCard from '@/components/ui/ImageCard.vue';
import TaxonName from '@/components/ui/TaxonName.vue';

const props = defineProps<{
  contextTaxon: TaxonWithImage;
  complexEntry: ComplexEntry;
}>();

const hasBothRoles = computed(() =>
  props.complexEntry.contextTaxonAsRole1.relationships.length > 0 &&
  props.complexEntry.contextTaxonAsRole2.relationships.length > 0,
);

const contextTaxonRoleName = computed(() => {
  if (hasBothRoles.value) return undefined;
  if (props.complexEntry.contextTaxonAsRole1.relationships.length > 0) {
    return props.complexEntry.contextTaxonAsRole1.name;
  }
  return props.complexEntry.contextTaxonAsRole2.name;
});


</script>

<template>
  <div class="multi-entry-complex-relation">
    <div class="multi-entry-complex-relation__taxa">

      <!-- Left: taxa where context taxon is the relatedTaxon (role2) -->
      <template v-if="complexEntry.contextTaxonAsRole2.relationships.length > 0">
        <RelatedTaxaList
          :relationships="complexEntry.contextTaxonAsRole2.relationships"
          :role-name="complexEntry.contextTaxonAsRole1.name"
        />
        <div class="multi-entry-complex-relation__arrow">
          <PhArrowFatRight size="32px" weight="fill" class="multi-entry-complex-relation__right-arrow" />
          <PhArrowFatDown size="32px" weight="fill" class="multi-entry-complex-relation__down-arrow" />
        </div>
      </template>

      <!-- Middle: context taxon -->
      <div class="multi-entry-complex-relation__center-card">
      <RelatedTaxaCard :is-context-taxon="true" :role-name="contextTaxonRoleName">
        <ImageCard :image="contextTaxon.image" :horizontal-on-mobile="true">
          <template #no-image>
            <div class="rel-card-no-image">
              <i>{{ contextTaxon.taxonLatname }}</i>
            </div>
          </template>
          <TaxonName
            :taxon-latname="contextTaxon.taxonLatname"
            :taxon-author="contextTaxon.taxonAuthor"
            :hide-scientific-name="true"
          />
        </ImageCard>
      </RelatedTaxaCard>
      </div>

      <!-- Right: taxa where context taxon is the taxon (role1) -->
      <template v-if="complexEntry.contextTaxonAsRole1.relationships.length > 0">
        <div class="multi-entry-complex-relation__arrow">
          <PhArrowFatRight size="32px" weight="fill" class="multi-entry-complex-relation__right-arrow" />
          <PhArrowFatDown size="32px" weight="fill" class="multi-entry-complex-relation__down-arrow" />
        </div>
        <RelatedTaxaList
          :relationships="complexEntry.contextTaxonAsRole1.relationships"
          :role-name="complexEntry.contextTaxonAsRole2.name"
          taxon-key="relatedTaxon"
        />
      </template>

    </div>
  </div>
</template>

<style>
.multi-entry-complex-relation__taxa {
  display: flex;
  flex-direction: column;
  gap: var(--size-md);
}

.multi-entry-complex-relation__arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-accent-2);
  flex-shrink: 0;
}

.multi-entry-complex-relation__right-arrow {
  display: none;
}

.multi-entry-complex-relation__down-arrow {
  display: block;
}

.multi-entry-complex-relation__center-card {
  width: 100%;
  align-self: center;
}

@media (min-width: 640px) {
  .multi-entry-complex-relation__center-card {
    width: calc(50% - var(--size-md) / 2);
  }
}

@media (min-width: 768px) {

}

@media (min-width: 1024px) {
  .multi-entry-complex-relation__center-card {
    width: calc(33.333% - var(--size-md) * 2 / 3);
  }
}

@media (min-width: 1280px) {
  .multi-entry-complex-relation__center-card {
    width: calc(25% - var(--size-md) * 3 / 4);
  }
}

@media (min-width: 1536px) {
}
</style>
