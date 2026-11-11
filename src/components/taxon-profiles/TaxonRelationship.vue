<script setup lang="ts">
import type { TaxonRelationship, TaxonRelationshipType, Taxon } from "localcosmos-client";

import SlotCard from "../ui/SlotCard.vue";
import ImageCard from "../ui/ImageCard.vue";
import TaxonName from "../ui/TaxonName.vue";
import { imageUrlsToSrcSet } from "@/composables/imageUrlsToSrcSet";
import GlossarizedText from "../text/GlossarizedText.vue";

import TaxonProfileLink from "../ui/TaxonProfileLink.vue";

const props = defineProps<{
  relationshipType: TaxonRelationshipType;
  relationship: TaxonRelationship;
  taxon: Taxon | null;
}>();

let mode = "simple";
let relatedTaxon = props.relationship.relatedTaxon;

if (props.relationshipType.taxonRole && props.relationshipType.relatedTaxonRole) {
  mode = "detailed";
} else {
  if (props.taxon && props.taxon != null) {
    if (
      // test if related Taxon is descendant of props.taxon or vice versa
      props.relationship.relatedTaxon.taxonNuid.indexOf(props.taxon.taxonNuid) !== -1 ||
      props.taxon.taxonNuid.indexOf(props.relationship.relatedTaxon.taxonNuid) !== -1 ||
      props.relationship.relatedTaxon.nameUuid === props.taxon.nameUuid
    ) {
      relatedTaxon = props.relationship.taxon;
    }
  }
}
</script>

<template>
  <div class="taxon-relationship">
    <component
      v-if="mode === 'simple'"
      :is="relatedTaxon?.hasTaxonProfile ? TaxonProfileLink : 'div'"
      :taxon="relatedTaxon"
      :class="relatedTaxon?.hasTaxonProfile ? 'nolinkstyle' : ''"
    >
      <SlotCard>
        <div class="simple-relationship">
          <div class="simple-relationship-image">
            <img
              v-if="relatedTaxon && relatedTaxon.image"
              loading="lazy"
              draggable="false"
              :src="relatedTaxon.image.imageUrl['2x']"
              :srcset="imageUrlsToSrcSet(relatedTaxon.image.imageUrl)"
              :sizes="'(min-width: 768px) 320px, 100vw'"
              :alt="
                relatedTaxon.image.altText
                  ? relatedTaxon.image.altText
                  : `{{ relatedTaxon.taxonLatname }} {{ relatedTaxon.taxonAuthor }}`
              "
              :title="
                relatedTaxon.image.title
                  ? relatedTaxon.image.title
                  : `{{ relatedTaxon.taxonLatname }} {{ relatedTaxon.taxonAuthor }}`
              "
            />
          </div>
          <div class="simple-relationship-details">
            <TaxonName
              v-if="taxon"
              :taxon-latname="relatedTaxon.taxonLatname"
              :taxon-author="relatedTaxon.taxonAuthor"
            />
            <div v-if="relationship.description" class="font-size-md">
              <GlossarizedText :htmlText="relationship.description" />
            </div>
          </div>
        </div>
      </SlotCard>
    </component>

    <div v-else>
      <SlotCard :flat="true" class="text-center no-padding-card">
        <div class="complex-relationship">
          <div class="taxon-roles">
            <div class="taxon-role-name">
              <strong>{{ relationshipType.taxonRole }}</strong>
            </div>
            <div class="related-taxon-role-name">
              <strong>{{ relationshipType.relatedTaxonRole }}</strong>
            </div>
          </div>
          <div class="complex-relationship-taxa">
            <div class="relationship-taxon">
              <component
                :is="
                  relationship.taxon?.hasTaxonProfile &&
                  relationship.taxon.nameUuid == relatedTaxon.nameUuid
                    ? TaxonProfileLink
                    : 'div'
                "
                :taxon="relationship.taxon"
                :class="relationship.taxon?.hasTaxonProfile ? 'nolinkstyle' : ''"
              >
                <TaxonName
                  :taxon-latname="relationship.taxon.taxonLatname"
                  :taxon-author="relationship.taxon.taxonAuthor"
                  :single-line="true"
                />
              </component>
            </div>
            <div class="relationship-related-taxon">
              <component
                :is="
                  relationship.relatedTaxon?.hasTaxonProfile &&
                  relationship.relatedTaxon.nameUuid == relatedTaxon.nameUuid
                    ? TaxonProfileLink
                    : 'div'
                "
                :taxon="relationship.relatedTaxon"
                :class="relatedTaxon?.hasTaxonProfile ? 'nolinkstyle' : ''"
              >
                <TaxonName
                  :taxon-latname="relationship.relatedTaxon.taxonLatname"
                  :taxon-author="relationship.relatedTaxon.taxonAuthor"
                  :single-line="true"
                />
              </component>
            </div>
          </div>
          <div v-if="relationship.description" class="font-size-md relationship-description">
            <GlossarizedText :htmlText="relationship.description" />
          </div>
        </div>
      </SlotCard>
    </div>
  </div>
</template>

<style>
@layer defaults {
  :root {

  }
}

.taxon-relationship .simple-relationship {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  text-align: center;
  gap: var(--size-sm);
}

.taxon-relationship .simple-relationship-image {
  height: 120px;
  aspect-ratio: 1 / 1;
}

.taxon-relationship .simple-relationship-image img {
  height: 100%;
  aspect-ratio: 1 / 1;
  border-radius: var(--border-radius-sm);
}

.taxon-relationship .simple-relationship-details {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
  gap: var(--size-xs);
}

.taxon-relationship .complex-relationship-taxa {
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  border-bottom: 1px solid #ddd;
  border-radius: 0 0 var(--border-radius-sm) var(--border-radius-sm);
}

.taxon-relationship .complex-relationship-taxa > div {
  padding: var(--size-sm);
  text-align: center;
  overflow: hidden;
}

.taxon-relationship .complex-relationship-taxa > div:last-child {
  min-width: 0; /* Allow flex items to shrink below content size */
  overflow: hidden;
  border-left: 1px solid #ddd; /* Add this line */
}

.taxon-relationship .taxon-roles {
  display: grid;
  grid-template-columns: 1fr 1fr;
}

.taxon-relationship .taxon-role-name {
  background: #919191; /* Darker slate grey */
  color: #fff;
  border-radius: var(--border-radius-sm) 0 0 0;
  padding: var(--size-xs);
}
.taxon-relationship .related-taxon-role-name {
  background: #9b9b9b; /* Medium slate grey */
  color: #fff;
  border-radius: 0 var(--border-radius-sm) 0 0;
  padding: var(--size-xs);
}

.taxon-relationship .no-padding-card {
  padding: 0;
  border: 1px solid #ddd;
}

.taxon-relationship .relationship-description {
  padding: var(--size-md);
}
</style>
