<script setup lang="ts">
import type { TaxonWithImage } from "localcosmos-client";
import { PhCaretRight } from "@phosphor-icons/vue";

import VernacularName from "../text/VernacularName.vue";
import TaxonProfileLink from "./TaxonProfileLink.vue";
import ColorButton from "./ColorButton.vue";

import { t } from "i18next";

const props = defineProps<{
  hero: TaxonWithImage;
}>();

const today = new Date();
const dateString = today.toLocaleDateString(undefined, {
  month: "long",
  day: "numeric",
  year: "numeric",
});
</script>

<template>
  <div class="hero-poster">
    <div
      class="hero-poster__bg"
      :style="hero.image ? '--hero-photo-url: url(' + hero.image.imageUrl['4x'] + ');' : ''"
    >
      <div>
        <div class="hero-poster__date">{{ $t("wonder of") }} - {{ dateString }}</div>
        <div class="hero-poster__name">
          <VernacularName
            :taxon-latname="hero.taxonLatname"
            :taxon-author="hero.taxonAuthor"
            :hide-taxon-author="true"
          />
        </div>
        <div class="hero-poster__scientificname">
          <i>{{ hero.taxonLatname }}</i>
        </div>
        <div class="mt-xl text-center">
          <TaxonProfileLink :taxon="hero" class="nolinkstyle">
            <ColorButton
              :text="t('SPECIES PROFILE')"
              size="medium"
              type="overlay"
            >
              <template #right>
                <PhCaretRight size="16" weight="bold" />
              </template>
            </ColorButton>
          </TaxonProfileLink>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
@layer defaults {
  :root {
    --hero-poster-name-font: var(--font-family-serif);
    --hero-bg-color: rgba(255,255,255,.7);
    --hero-date-color: var(--color-accent-1);
    --hero-scientificname-color: var(--color-accent-3);
    --hero-bg-image: linear-gradient(
        to right,
        rgba(0, 0, 0, 1) 0%,
        rgba(0, 0, 0, 0.6) 5%,
        rgba(0, 0, 0, 0) 40%,
        rgba(0, 0, 0, 0) 50%,
        rgba(0, 0, 0, 0) 60%,
        rgba(0, 0, 0, 0.6) 95%,
        rgba(0, 0, 0, 1) 100%
      ),
      radial-gradient(
        circle at center,
        rgba(0, 0, 0, 0.7) 0%,
        rgba(0, 0, 0, 0.3) 42%,
        rgba(0, 0, 0, 0.45) 62%,
        rgba(0, 0, 0, 1) 90%,
        rgba(0, 0, 0, 1) 100%
      );

    --darkmode-hero-bg-color: rgba(0,0,0,.7);
    --darkmode-hero-date-color: var(--color-accent-1);
    --darkmode-hero-scientificname-color: var(--color-accent-3);
    --darkmode-hero-bg-image: var(--hero-bg-image);
  }
}

.hero-poster {
  width: 100%;
  aspect-ratio: 1/1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--hero-bg-color);
}

body.dark .hero-poster {
  background: var(--darkmode-hero-bg-color);
}

body.dark .hero-poster__date {
  color: var(--darkmode-hero-date-color);
}

body.dark .hero-poster__scientificname {
  color: var(--darkmode-hero-scientificname-color);
}

.hero-poster__date {
  color: var(--hero-date-color);
  text-transform: uppercase;
  font-weight: 600;
  font-style: normal;
  text-align: center;
  font-size: 0.8rem;
}

.hero-poster__name {
  font-size: 1.6rem;
  font-family: var(--hero-poster-name-font);
  color: white;
  padding: var(--size-sm) 0;
  text-align: center;
}

.hero-poster__scientificname {
  color: var(--hero-scientificname-color);
  font-size: 1rem;
  font-style: italic;
  text-align: center;
}

.hero-poster__bg {
  width: 100%;
  height: 100%;
  position: relative;
  background-image: var(--hero-bg-image), var(--hero-photo-url);
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  display: flex;
  align-items: center;
  justify-content: center;
}

body.dark .hero-poster__bg {
  background-image: var(--darkmode-hero-bg-image), var(--hero-photo-url);
}

@media (min-width: 640px) {
}

@media (min-width: 768px) {
  .hero-poster {
    margin-left: var(--navigation-rail-width);
    width: calc(100% - var(--navigation-rail-width));
  }
}

@media (min-width: 1024px) {
  .hero-poster {
    aspect-ratio: 3/2;
  }

  .hero-poster__name {
    font-size: 2rem;
  }

  .hero-poster__scientificname {
    font-size: 1rem;
  }

  .hero-poster__date {
    font-size: 1rem;
  }
}

@media (min-width: 1280px) {
  .hero-poster {
    aspect-ratio: 16/12;
    width: calc(1280px - (var(--size-md) * 2));
    margin: 0 auto;
    padding-top: var(--desktop-header-bar-height);
  }
}

@media (min-width: 1536px) {
}
</style>

