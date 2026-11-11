<script setup lang="ts">
import { computed, inject } from 'vue';
import type { DatasetListEntry, BackboneTaxonomy } from 'localcosmos-client';
import TaxonName from '@/components/ui/TaxonName.vue';
import DisplayName from '@/components/ui/DisplayName.vue';
import { getTaxonomicImageFileName } from '@/composables/getTaxonomicImageFileName';

const props = defineProps<{
  observation: DatasetListEntry;
  relativeTime: string;
}>();

const backboneTaxonomy = inject('backboneTaxonomy') as BackboneTaxonomy;

const vernacularName = computed(() =>
  props.observation.taxon
    ? backboneTaxonomy.vernacular(props.observation.taxon.nameUuid)
    : null,
);

const imageUrl = computed(() => {
  if (props.observation.imageUrl?.['2x']) return props.observation.imageUrl['2x'];
  if (props.observation.imageUrl?.['1x']) return props.observation.imageUrl['1x'];
  if (props.observation.taxon) {
    const file = getTaxonomicImageFileName(
      props.observation.taxon.taxonSource,
      props.observation.taxon.taxonNuid,
    );
    return `/images/taxonomy-placeholder/${file ?? 'unknown'}.svg`;
  }
  return '';
});
</script>

<template>
  <div
    class="spotlight-card"
    :style="imageUrl ? `--spotlight-photo-url: url(${imageUrl})` : ''"
  >
    <div class="spotlight-card__bg">
      <div class="spotlight-card__content">
        <div class="spotlight-card__taxon">
          <TaxonName
            :taxon-latname="observation.taxon.taxonLatname"
            :taxon-author="observation.taxon.taxonAuthor"
            :vernacular-name="vernacularName"
            :hide-taxon-author="true"
            font-size="1.35rem"
          />
        </div>
        <div class="spotlight-card__meta">
          <DisplayName :user="observation.user" />
          <span class="spotlight-card__dot">·</span>
          <span class="spotlight-card__time">{{ relativeTime }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
@layer defaults {
  :root {
    --spotlight-card-fallback-bg: var(--color-neutral-2, #085b7e);
    --spotlight-card-overlay: linear-gradient(
      to top,
      rgba(0, 0, 0, 0.85) 0%,
      rgba(0, 0, 0, 0.25) 55%,
      rgba(0, 0, 0, 0) 100%
    );
    --spotlight-photo-url: none;
  }
}

.spotlight-card {
  width: 100%;
  aspect-ratio: 4 / 3;
  border-radius: var(--border-radius);
  overflow: hidden;
  box-shadow: var(--box-shadow);
  background: var(--spotlight-card-fallback-bg);
}

.spotlight-card__bg {
  width: 100%;
  height: 100%;
  background-image: var(--spotlight-card-overlay), var(--spotlight-photo-url);
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  display: flex;
  align-items: flex-end;
}

.spotlight-card__content {
  padding: var(--size-md) var(--size-lg);
  width: 100%;
}

.spotlight-card__taxon {
  color: #fff;
}

.spotlight-card__taxon .taxon-name__primary,
.spotlight-card__taxon .taxon-name__primary--alternative {
  font-family: var(--hero-poster-name-font, var(--font-family-serif));
  color: #fff;
}

.spotlight-card__taxon .taxon-name__scientific--secondary {
  color: var(--color-accent-3, #a9cfd0);
}

.spotlight-card__meta {
  display: flex;
  align-items: center;
  gap: var(--gap-small);
  margin-top: var(--size-xs);
  font-size: var(--font-size-sm);
  color: rgba(255, 255, 255, 0.75);
}

.spotlight-card__time {
  color: rgba(255, 255, 255, 0.75);
}

@media (min-width: 1024px) {
  .spotlight-card {
    aspect-ratio: 16 / 7;
  }
}
</style>
