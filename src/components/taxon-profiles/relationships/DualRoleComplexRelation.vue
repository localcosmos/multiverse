<script setup lang="ts">
import type { TaxonWithImage } from 'localcosmos-client';
import type { ComplexEntry } from './TaxonRelationships.vue';

import { PhArrowFatDown, PhArrowFatRight } from '@phosphor-icons/vue';
import RelatedTaxaCard from './RelatedTaxaCard.vue';
import ImageCard from '@/components/ui/ImageCard.vue';
import TaxonName from '@/components/ui/TaxonName.vue';
import TaxonProfileLink from '@/components/ui/TaxonProfileLink.vue';

const props = defineProps<{
  contextTaxon: TaxonWithImage;
  complexEntry: ComplexEntry;
}>();

// In dualRole: contextTaxonAsRole2.relationships[0].taxon  = the role1 entity (left side)
//              contextTaxonAsRole1.relationships[0].relatedTaxon = the role2 entity (right side)
const leftTaxon = props.complexEntry.contextTaxonAsRole2.relationships[0].taxon;
const rightTaxon = props.complexEntry.contextTaxonAsRole1.relationships[0].relatedTaxon;
</script>

<template>
  <div class="dual-role-complex-relation">
    <div class="dual-role-complex-relation__taxa">

      <!-- Left: the role1 entity pointing at the context taxon -->
      <RelatedTaxaCard :role-name="complexEntry.contextTaxonAsRole1.name">
        <TaxonProfileLink :taxon="leftTaxon" class="nolinkstyle">
          <ImageCard :image="leftTaxon.image" :horizontal-on-mobile="true">
            <template #no-image>
              <div class="rel-card-no-image"><i>{{ leftTaxon.taxonLatname }}</i></div>
            </template>
            <TaxonName
              :taxon-latname="leftTaxon.taxonLatname"
              :taxon-author="leftTaxon.taxonAuthor"
              :hide-scientific-name="true"
            />
            <div>
              {{ complexEntry.contextTaxonAsRole1.relationships[0].description }}
            </div>
          </ImageCard>
        </TaxonProfileLink>
      </RelatedTaxaCard>

      <!-- Arrow -->
      <div class="dual-role-complex-relation__arrow">
        <PhArrowFatRight size="32px" weight="fill" class="dual-role-complex-relation__right-arrow" />
        <PhArrowFatDown size="32px" weight="fill" class="dual-role-complex-relation__down-arrow" />
      </div>

      <!-- Middle: context taxon in both roles -->
      <RelatedTaxaCard
        :is-context-taxon="true"
      >
        <ImageCard :image="contextTaxon.image" :horizontal-on-mobile="true">
          <template #no-image>
            <div class="rel-card-no-image"><i>{{ contextTaxon.taxonLatname }}</i></div>
          </template>
          <TaxonName
            :taxon-latname="contextTaxon.taxonLatname"
            :taxon-author="contextTaxon.taxonAuthor"
            :hide-scientific-name="true"
          />
        </ImageCard>
      </RelatedTaxaCard>

      <!-- Arrow -->
      <div class="dual-role-complex-relation__arrow">
        <PhArrowFatRight size="32px" weight="fill" class="dual-role-complex-relation__right-arrow" />
        <PhArrowFatDown size="32px" weight="fill" class="dual-role-complex-relation__down-arrow" />
      </div>

      <!-- Right: the role2 entity the context taxon points at -->
      <RelatedTaxaCard :role-name="complexEntry.contextTaxonAsRole2.name">
        <TaxonProfileLink :taxon="rightTaxon" class="nolinkstyle">
          <ImageCard :image="rightTaxon.image" :horizontal-on-mobile="true">
            <template #no-image>
              <div class="rel-card-no-image"><i>{{ rightTaxon.taxonLatname }}</i></div>
            </template>
            <TaxonName
              :taxon-latname="rightTaxon.taxonLatname"
              :taxon-author="rightTaxon.taxonAuthor"
              :hide-scientific-name="true"
            />
            <div>
              {{ complexEntry.contextTaxonAsRole2.relationships[0].description }}
            </div>
          </ImageCard>
        </TaxonProfileLink>
      </RelatedTaxaCard>

    </div>
  </div>
</template>

<style>
@layer defaults {
  :root {
    --taxon-relation-arrow-color: var(--color-accent-2);
    --darkmode-taxon-relation-arrow-color: var(--color-accent-2);
  }
}

.dual-role-complex-relation__taxa {
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: auto;
  gap: var(--size-md);
}

.dual-role-complex-relation__arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--taxon-relation-arrow-color);
  flex-shrink: 0;
}

body.dark .dual-role-complex-relation__arrow {
  color: var(--darkmode-taxon-relation-arrow-color);
}

.dual-role-complex-relation__right-arrow {
  display: none;
}

.dual-role-complex-relation__down-arrow {
  display: block;
}

@media (min-width: 640px) {
  .dual-role-complex-relation__taxa {
    grid-template-columns: 1fr auto 1fr auto 1fr;
    grid-template-rows: 1fr;
  }

  .dual-role-complex-relation__right-arrow {
    display: block;
  }

  .dual-role-complex-relation__down-arrow {
    display: none;
  }
}
</style>
