<script setup lang="ts">
import type { SearchTaxon } from "localcosmos-client";
import ImageWithLicence from "@/components/images/ImageWithLicence.vue";
import TaxonProfileLink from "../ui/TaxonProfileLink.vue";

const props = defineProps<{
  taxon: SearchTaxon;
}>();
</script>

<template>
  <TaxonProfileLink
    :taxon="taxon"
    class="taxon-profiles-search-result nolinkstyle"
  >
    <div class="taxon-profiles-search-result__card">
      <div class="taxon-profiles-search-result__name-container">
        <div>
          <div>
            <span class="taxon-profiles-search-result__primary-name">{{ taxon.name }}</span>
          </div>
          <div>
            <div class="taxon-profiles-search-result__latname">
              {{ taxon.taxonLatname }}
              <!--
              <span v-if="taxon.taxonAuthor" class="taxon-author">
                {{ taxon.taxonAuthor }}
              </span>
            --></div>
          </div>
        </div>
      </div>
      <div
        v-if="taxon.image"
        class="taxon-profiles-search-result__image-container"
      >
        <ImageWithLicence
          :image="taxon.image"
          :title="taxon.name"
          :show-caption="false"
        />
      </div>
      <div v-else class="taxon-profiles-search-result__no-image"></div>
    </div>
  </TaxonProfileLink>
</template>

<style>
@layer defaults {
  :root {
    --taxon-profiles-search-result-border-radius: var(--border-radius-xs);
    --taxon-profiles-search-result-bg: var(--bg-translucent-light);
    --taxon-profiles-search-result-latname-color: var(--color-text-muted);

    --darkmode-taxon-profiles-search-result-bg: rgba(255,255,255, .7);
    --darkmode-taxon-profiles-search-result-latname-color: var(--color-text-muted);
  }
}

.taxon-profiles-search-result__card {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  padding: var(--size-sm) var(--size-2xl);
  background: var(--taxon-profiles-search-result-bg);
  border-radius: var(--taxon-profiles-search-result-border-radius);
}

body.dark .taxon-profiles-search-result__card {
  background: var(--darkmode-taxon-profiles-search-result-bg);
}


.taxon-profiles-search-result__name-container {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: var(--gap-medium);
  justify-content: center;
  align-items: flex-start;
}

.taxon-profiles-search-result__image-container {
  position: relative;
}

.taxon-profiles-search-result__no-image {
  height: 70px;
  aspect-ratio: 1/1;
}

.taxon-profiles-search-result__primary-name {
  font-weight: bold;
}

/* single line */
.taxon-profiles-search-result__latname {
  font-style: italic;
  font-size: var(--font-size-md);
  color: var(--taxon-profiles-search-result-latname-color);
}

.taxon-profiles-search-result__author {
  font-style: normal;
}

.taxon-profiles-search-result__image-container {
  height: 70px;
  aspect-ratio: 1/1;
  border-radius: var(--taxon-profiles-search-result-border-radius);
}

.taxon-profiles-search-result__licence-circle {
  position: absolute;
  bottom: -4px;
  left: -4px;
}
</style>
