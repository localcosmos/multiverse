<script setup lang="ts">
import { computed } from 'vue';
import type { TaxonRelationship, TaxonWithImage } from 'localcosmos-client';

import { PhArrowFatDown, PhArrowFatRight } from "@phosphor-icons/vue";
import RelatedTaxaCard from './RelatedTaxaCard.vue';
import ImageCard from '@/components/ui/ImageCard.vue';
import TaxonName from '@/components/ui/TaxonName.vue';
import TaxonProfileLink from '@/components/ui/TaxonProfileLink.vue';
import GlossarizedText from '@/components/text/GlossarizedText.vue';

const props = defineProps<{
  relationship: TaxonRelationship;
  contextTaxon: TaxonWithImage;
  role1Name: string;
  role2Name: string;
}>();

type Side = {
  taxon: TaxonWithImage;
  roleName: string;
  isContextTaxon: boolean;
  description: string;
};

const contextIsRole1 = computed(() => props.relationship.taxon.nameUuid === props.contextTaxon.nameUuid);

const left = computed<Side>(() =>
  contextIsRole1.value
    ? { taxon: props.contextTaxon, roleName: props.role1Name, isContextTaxon: true, description: '' }
    : { taxon: props.relationship.taxon, roleName: props.role1Name, isContextTaxon: false, description: props.relationship.description },
);

const right = computed<Side>(() =>
  contextIsRole1.value
    ? { taxon: props.relationship.relatedTaxon, roleName: props.role2Name, isContextTaxon: false, description: props.relationship.description }
    : { taxon: props.contextTaxon, roleName: props.role2Name, isContextTaxon: true, description: '' },
);
</script>

<template>
  <div class="single-complex-relation">
    <div class="single-complex-relation__taxa">
      <RelatedTaxaCard :role-name="left.roleName" :is-context-taxon="left.isContextTaxon">
        <TaxonProfileLink :taxon="left.isContextTaxon ? undefined : left.taxon" class="nolinkstyle">
          <ImageCard :image="left.taxon.image" :horizontal-on-mobile="true">
            <template #no-image><div class="rel-card-no-image"><i>{{ left.taxon.taxonLatname }}</i></div></template>
            <TaxonName :taxon-latname="left.taxon.taxonLatname" :taxon-author="left.taxon.taxonAuthor" :hide-scientific-name="true" />
            <div v-if="left.description" class="single-complex-relation__description">
              <GlossarizedText :htmlText="left.description" />
            </div>
          </ImageCard>
        </TaxonProfileLink>
      </RelatedTaxaCard>

      <div class="single-complex-relation__arrow">
        <PhArrowFatRight size="32px" weight="fill" class="single-complex-relation__right-arrow" />
        <PhArrowFatDown size="32px" weight="fill" class="single-complex-relation__down-arrow" />
      </div>

      <RelatedTaxaCard :role-name="right.roleName" :is-context-taxon="right.isContextTaxon">
        <TaxonProfileLink :taxon="right.isContextTaxon ? undefined : right.taxon" class="nolinkstyle">
          <ImageCard :image="right.taxon.image" :horizontal-on-mobile="true">
            <template #no-image><div class="rel-card-no-image"><i>{{ right.taxon.taxonLatname }}</i></div></template>
            <TaxonName :taxon-latname="right.taxon.taxonLatname" :taxon-author="right.taxon.taxonAuthor" :hide-scientific-name="true" />
            <div v-if="right.description" class="single-complex-relation__description">
              <GlossarizedText :htmlText="right.description" />
            </div>
          </ImageCard>
        </TaxonProfileLink>
      </RelatedTaxaCard>
    </div>
  </div>

</template>

<style>
.single-complex-relation__taxa {
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 1fr auto 1fr;
  gap: var(--size-md);
}

.single-complex-relation__arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-accent-2);
  flex-shrink: 0;
}

.single-complex-relation__right-arrow {
  display: none;
}

.single-complex-relation__down-arrow {
  display: block;
}

@media (min-width: 640px) {
  .single-complex-relation__taxa {
    grid-template-columns: 1fr auto 1fr;
    grid-template-rows: 1fr;
  }

  .single-complex-relation__right-arrow {
    display: block;
  }

  .single-complex-relation__down-arrow {
    display: none;
  }
}

@media (min-width: 768px) {
}

@media (min-width: 1024px) {
  .single-complex-relation__taxa {
    grid-template-columns: 1fr auto 1fr 1fr;
  }
}

@media (min-width: 1280px) {
  .single-complex-relation__taxa {
    grid-template-columns: 1fr auto 1fr 1fr 1fr;
  }
}

@media (min-width: 1536px) {
}
</style>
