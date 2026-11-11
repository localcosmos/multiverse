<script setup lang="ts">
import { computed } from "vue";
import type {
  TypedTaxonRelationships,
  TaxonWithImage,
  TaxonRelationship,
} from "localcosmos-client";

import SimpleRelationship from "./SimpleRelationship.vue";
import SingleComplexRelation from "./SingleComplexRelation.vue";
import DualRoleComplexRelation from "./DualRoleComplexRelation.vue";

import MultiEntryComplexRelation from "./MultiEntryComplexRelation.vue";

const props = defineProps<{
  contextTaxon: TaxonWithImage;
  relationships: TypedTaxonRelationships[];
}>();

type RelationshipRole = {
  name: string;
  relationships: TaxonRelationship[];
};

export type ContextualSimpleRelationship = {
  contextTaxon: TaxonWithImage;
  relatedTaxon: TaxonWithImage;
  description: string;
};

export type SimpleEntry = {
  kind: "simple";
  name: string;
  relationships: ContextualSimpleRelationship[];
};

export type ComplexEntry = {
  kind: "complex";
  name: string;
  contextTaxonAsRole1: RelationshipRole;
  contextTaxonAsRole2: RelationshipRole;
  layout: "multipleEntries" | "dualRole" | "singleRelation";
};

type RelationshipEntry = SimpleEntry | ComplexEntry;

const orderedRelationships = computed<RelationshipEntry[]>(() =>
  props.relationships
    .filter((r) => r.relationships.length > 0)
    .map((r) => {
      const { relationshipType, relationships } = r;
      if (relationshipType.taxonRole && relationshipType.relatedTaxonRole) {
        return {
          kind: "complex",
          name: relationshipType.name,
          contextTaxonAsRole1: {
            name: relationshipType.taxonRole,
            relationships: relationships.filter(
              (rel) => rel.taxon.nameUuid === props.contextTaxon.nameUuid,
            ),
          },
          contextTaxonAsRole2: {
            name: relationshipType.relatedTaxonRole,
            relationships: relationships.filter(
              (rel) => rel.relatedTaxon.nameUuid === props.contextTaxon.nameUuid,
            ),
          },
          layout: (() => {
            const role1Count = relationships.filter(
              (rel) => rel.taxon.nameUuid === props.contextTaxon.nameUuid,
            ).length;
            const role2Count = relationships.filter(
              (rel) => rel.relatedTaxon.nameUuid === props.contextTaxon.nameUuid,
            ).length;
            if (role1Count > 1 || role2Count > 1) return "multipleEntries";
            if (role1Count > 0 && role2Count > 0) return "dualRole";
            return "singleRelation";
          })() as ComplexEntry["layout"],
        } satisfies ComplexEntry;
      } else {
        return {
          kind: "simple",
          name: relationshipType.name,
          relationships: relationships.map((rel) =>
            rel.taxon.nameUuid === props.contextTaxon.nameUuid
              ? {
                  contextTaxon: rel.taxon,
                  relatedTaxon: rel.relatedTaxon,
                  description: rel.description,
                }
              : {
                  contextTaxon: rel.relatedTaxon,
                  relatedTaxon: rel.taxon,
                  description: rel.description,
                },
          ),
        } satisfies SimpleEntry;
      }
    }),
);
</script>

<template>
  <div class="taxon-relationships">
    <div v-for="item in orderedRelationships" :key="item.name" class="mb-2xl">
      <div class="mb-xl">
        <h2>{{ item.name }}</h2>
      </div>
      <SimpleRelationship
        v-if="item.kind === 'simple'"
        :context-taxon="contextTaxon"
        :simple-entry="item"
      />

      <div v-else :class="`taxon-relationships__complex-entries--${item.layout}`">
        <SingleComplexRelation
          v-if="item.layout === 'singleRelation'"
          :context-taxon="contextTaxon"
          :relationship="
            item.contextTaxonAsRole1.relationships[0] ?? item.contextTaxonAsRole2.relationships[0]
          "
          :role1-name="item.contextTaxonAsRole1.name"
          :role2-name="item.contextTaxonAsRole2.name"
        />
        <DualRoleComplexRelation
          v-else-if="item.layout === 'dualRole'"
          :context-taxon="contextTaxon"
          :complex-entry="item"
        />

        <MultiEntryComplexRelation
          v-else-if="item.layout === 'multipleEntries'"
          :context-taxon="contextTaxon"
          :complex-entry="item"
        />
      </div>
    </div>
  </div>
</template>

<style>
.taxon-relationships {
  display: flex;
  flex-direction: column;
  gap: var(--size-xl);
  align-items: stretch;
}

.taxon-relationships__complex-arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-accent-2);
  flex-shrink: 0;
}

.taxon-relationships__complex-arrow .arrow-right {
  display: none;
}

.taxon-relationships__complex-arrow .arrow-down {
  display: block;
}

.related-taxa-card.context-taxon {
  background: var(--color-accent-3);
}

.related-taxa-card.context-taxon .related-taxa-card__role-label {
  color: var(--color-neutral);
}
</style>
