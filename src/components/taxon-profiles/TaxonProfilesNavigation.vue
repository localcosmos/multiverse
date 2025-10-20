<script setup lang="ts">
import { onMounted, ref, inject, nextTick } from 'vue';
import { useMainNavigationStore } from '@/stores/main-navigation';
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue';
import TaxonProfilesNavigationNode from './TaxonProfilesNavigationNode.vue';
import ImageCarousel from '../images/ImageCarousel.vue';
import { t } from 'i18next';
import type { TaxonProfiles, TaxonProfilesNavigationNodeChild, TaxonProfilesNavigationNode as TaxonProfilesNavigationNodeType, TaxonWithSlugsAndImages } from 'localcosmos-client';

type TranslatedTaxonProfilesNavigationNodeChild = TaxonProfilesNavigationNodeChild & {
  vernacularName: string|null,
  scientificName: string,
  taxonLatname: string,
  taxonAuthor?: string,
  primaryName: string,
};

type TranslatedTaxonWithSlugsAndImages = TaxonWithSlugsAndImages & {
  vernacularName: string|null,
  scientificName: string,
  primaryName: string,
};

const taxonProfiles = inject('taxonProfiles') as TaxonProfiles;

const mainNavigation = useMainNavigationStore();

const loading = ref<boolean>(true);

const navigationNode = ref<null|TaxonProfilesNavigationNodeType>(null);

const nodesContainer = ref<HTMLElement|null>(null);
const resultsContainer = ref<HTMLElement|null>(null);

const nodeDisplayClass = ref<string>('');

/** it is required to translate all names and then sort the nodes / profiles */
const subNodes = ref<TranslatedTaxonProfilesNavigationNodeChild[]>([]);
const nodeTaxonProfiles = ref<TranslatedTaxonWithSlugsAndImages[]>([]);

const props = defineProps<{
  nodeKey: string
}>();

const getNodeDisplayClass = (node:TaxonProfilesNavigationNodeType): string => {
  let displayClass = '';

  if (node.isTerminalNode) {
    displayClass = 'terminal';
  } else {
    
    if (node.imageAnalysis.nodes.modeImages == 0) {
      displayClass += ' mode-images-0';
    } else if (node.imageAnalysis.nodes.modeImages == 1) {
      displayClass += ' mode-images-1';
    } else if (node.imageAnalysis.nodes.modeImages == 2) {
      displayClass += ' mode-images-2';
    } else {
      displayClass += ' mode-images-3';
    }

    if (node.imageAnalysis.nodes.maxImages == 0) {
      displayClass += ' max-images-0';
    } else if (node.imageAnalysis.nodes.maxImages == 1) {
      displayClass += ' max-images-1';
    } else if (node.imageAnalysis.nodes.maxImages == 2) {
      displayClass += ' max-images-2';
    } else {
      displayClass += ' max-images-3';
    }
  }

  return displayClass;
}

const getImageCountClass = (imageCount: number) => {

  let hasImages = '';

  if (imageCount > 0) {
    hasImages ='has-images'
  }

  let number = imageCount;
  if (number > 3) {
    number = 3;
  }

  return `${hasImages} image-count-${number}`;

};

onMounted(async () => {
  const node = await taxonProfiles.getNavigationNode(props.nodeKey);
  // sort node.taxonProfiles by their translated 
  navigationNode.value = node;
  if (node != null) {

    // get the display class
    nodeDisplayClass.value = getNodeDisplayClass(node);

    if (node.isStartNode == false) {
      mainNavigation.setCurrentPageTitle(node.verboseName);
    }

    // results
    const attachedTaxonProfiles: TranslatedTaxonWithSlugsAndImages[] = [];

    node.taxonProfiles.forEach((taxonProfileReference) => {

    let scientificName: string = `${taxonProfileReference.taxonLatname} ${taxonProfileReference.taxonAuthor}`;
    let vernacularName: string|null = t(scientificName);
    let primaryName: string = vernacularName; // for sorting

    if (vernacularName === scientificName) {
      vernacularName = null;
    }

    const translatedTaxon:TranslatedTaxonWithSlugsAndImages = { ...taxonProfileReference, vernacularName, scientificName, primaryName };
    if (taxonProfileReference.primaryImage) {
      translatedTaxon.images = [taxonProfileReference.primaryImage];
    } else if (taxonProfileReference.images.length) {
      translatedTaxon.images = taxonProfileReference.images.slice(0,1);
    }
    attachedTaxonProfiles.push(translatedTaxon);

    });

    attachedTaxonProfiles.sort((a, b) => a.taxonLatname.localeCompare(b.taxonLatname));
    nodeTaxonProfiles.value = attachedTaxonProfiles;

    // children
    const attachedNodes:TranslatedTaxonProfilesNavigationNodeChild[] = [];

    node.children.forEach((child) => {
      let scientificName: string = '';
      let taxonLatname: string = '';
      let vernacularName: string|null = null;
      let primaryName: string = t(child.verboseName);

      if (child.name == null) {

        const taxonLatnames:string[] = [];

        child.taxa.forEach((taxon) => {
          taxonLatnames.push(taxon.taxonLatname);
        });
        scientificName = taxonLatnames.join();
        taxonLatname = scientificName;

      } else {
        vernacularName = t(child.verboseName);
      }
      const translatedChild:TranslatedTaxonProfilesNavigationNodeChild = { ...child, vernacularName, taxonLatname, scientificName, primaryName };
      attachedNodes.push(translatedChild);
    });

    // attachedNodes.sort((a, b) => a.primaryName.localeCompare(b.primaryName));
    subNodes.value = attachedNodes;
    
  }
  loading.value = false;

  // Restore scroll position after DOM update
  await nextTick();
  // Custom event for scroll restoration
  window.dispatchEvent(new CustomEvent('restore-scroll'));
});

</script>

<template>
  <div>
    <div v-if="loading" class="text-center">
      <LoadingSpinner />
    </div>
    <div v-else>
      <div v-if="navigationNode">
        <div
          v-if="navigationNode.images.length && !(navigationNode.isTerminalNode)"
          class="carousel-container"
        >
          <ImageCarousel
            class="margin-bottom"
            :images="navigationNode.images"
          />
        </div>
        <div class="page-padding-x pt-m">
          <h1
            v-if="navigationNode.isStartNode == false"
            class="padding-bottom"
            :class="navigationNode.isTerminalNode == true ? '' : ' h1-margin-top'"
          >
            <span class="font-weight-bolder" :class="navigationNode.name == null ? 'scientific-name' : ''">
              {{ $t(navigationNode.verboseName) }}
            </span>
          </h1>
          <div>
            <div
              v-if="navigationNode.description"
              class="padding-bottom"
            >
              {{ navigationNode.description }}
            </div>
            <div
              ref="nodesContainer"
              class="tp-navigation-nodes"
              :class="nodeDisplayClass"
            >
              <div
                v-for="child in subNodes"
                :key="child.key"
                :class="getImageCountClass(child.images.length)"
              >
                <RouterLink
                  :to="{ name: 'taxon-profiles-node', params: { slug: child.slug } }"
                  class="nolinkstyle"
                >
                  <TaxonProfilesNavigationNode
                    :taxon-latname="child.taxonLatname"
                    :taxon-author="''"
                    :vernacular-name="child.vernacularName"
                    :images="child.images"
                    :is-terminal-node="navigationNode.isTerminalNode"
                  >
                  </TaxonProfilesNavigationNode>
                </RouterLink>
              </div>
            </div>
            <div
              ref="resultsContainer"
              class="tp-navigation-results"
            >
              <div
                v-for="(taxonProfile, counter) in nodeTaxonProfiles"
                :key="counter"
                class="tp-result"
                :class="getImageCountClass(taxonProfile.images.length)"
              >
                <div
                  v-if="taxonProfile.slug"
                  class="h-full"
                >
                  <RouterLink
                    :to="{ name: 'taxon-profile', params: { slug: taxonProfile.slug } }"
                    class="nolinkstyle"
                  >
                    <TaxonProfilesNavigationNode
                      :taxon-latname="taxonProfile.taxonLatname"
                      :taxon-author="taxonProfile.taxonAuthor"
                      :vernacular-name="taxonProfile.vernacularName"
                      :images="taxonProfile.images"
                      :is-terminal-node="navigationNode.isTerminalNode"
                    >
                    </TaxonProfilesNavigationNode>
                  </RouterLink>
                </div>
                <div v-else class="h-full">
                  <RouterLink
                    :to="{ name: 'taxon-profile-nameuuid', params: { nameUuid: taxonProfile.nameUuid } }"
                    class="nolinkstyle"
                  >
                    <TaxonProfilesNavigationNode
                      :taxon-latname="taxonProfile.taxonLatname"
                      :taxon-author="taxonProfile.taxonAuthor"
                      :vernacular-name="taxonProfile.vernacularName"
                      :images="taxonProfile.images"
                      :is-terminal-node="navigationNode.isTerminalNode"
                    >
                    </TaxonProfilesNavigationNode>
                  </RouterLink>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-else>
        {{ $t('taxonProfiles.navigationNodeNotFound') }}
      </div>
    </div>
  </div>
</template>

<style>

/**
* the smallest screen size has always 1 species column and 1 image column
*/

.tp-navigation-nodes, .tp-navigation-results {
  display: grid;
  gap: var(--gap-medium);
  row-gap: var(--gap-medium);
  grid-template-columns: repeat(1, 1fr); /** minimum number of columns for small screens */
}

.tp-navigation-nodes {
  margin-bottom: var(--gap-medium);
}

.tp-navigation-nodes .tp-node-name, .tp-navigation-results .tp-node-name {
  width: calc( ( 100dvw - (var(--size-md) * 4)) );
}

.tp-navigation-nodes > div, .tp-navigation-nodes a {
  height: 100%;
}

.tp-navigation-nodes a {
  display: block;
}

.tp-node-images {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  column-gap: var(--gap-medium);
  row-gap: var(--gap-medium);
}

/** columns for the images */
/** default */
.tp-navigation-nodes .tp-node-images {
  grid-template-columns: repeat(1, 1fr);
}

/** max-images-1 alwyas has 1 image column */
.tp-navigation-nodes.terminal .tp-node-images, .tp-navigation-nodes.max-images-1 .tp-node-images {
  grid-template-columns: repeat(1, 1fr);
}

/** FLEX VERSION */
.tp-navigation-nodes.flex {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  column-gap: var(--gap-medium);
  row-gap: var(--gap-medium);
}

.tp-navigation-nodes.flex > div {
  flex-grow: 1;
}

.tp-navigation-nodes.flex > div.has-images {
  flex-grow: 0;
}

.tp-navigation-nodes.flex > div.tp-result {
  flex-grow: 0;
}

.tp-navigation-nodes.flex .tp-node-images {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  column-gap: var(--gap-medium);
  row-gap: var(--gap-medium);
}

.tp-navigation-nodes.flex .tp-node-image, .tp-navigation-nodes.flex .tp-node-name {
  width: 100%;
}

/**
* 350px
* - default: 1 species column, 3 image columns
* - if max-images-1 or terminal: 2 species columns, 1 image column
*
* Flex version
* - optimized for one card with 3 images
* - 
*/
@media (min-width: 350px) {

  .tp-navigation-results {
    grid-template-columns: repeat(2, 1fr);
  }

  .tp-navigation-nodes .tp-node-images {
    grid-template-columns: repeat(3, 1fr);
  }

  .tp-navigation-nodes .tp-node-name {
    width: calc( ( 100dvw - (var(--size-md) * 4) ) );
  }

  .tp-navigation-results .tp-node-name {
    width: calc( ( 100dvw - (var(--size-md) * 6) - (var(--gap-medium) * 2) ) / 2 );
  }

  /** FLEX VERSION */
  .tp-navigation-nodes.flex .tp-node-image {
    width: calc( ( 100dvw - (var(--size-md) * 4) - (var(--gap-medium) * 2) ) / 3 );
  }

  /** terminal node is optimized for two cards next to each other while both cards have 1 image */
  .tp-navigation-nodes.flex.terminal .tp-node-image, .tp-navigation-nodes.flex.terminal .tp-node-name {
    width: calc( ( 100dvw - (var(--size-md) * 6) - (var(--gap-medium) * 1) ) / 2 );
  }

  /** max-images-1 is optimized for two cards next to each other while both cards have 1 image */
  .tp-navigation-nodes.max-images-1 {
    grid-template-columns: repeat(2, 1fr);
  }

  .tp-navigation-nodes.max-images-1 .tp-node-name {
    width: calc( ( 100dvw - (var(--size-md) * 6) - (var(--gap-medium) * 2) ) / 2 );
  }

}

@media (min-width: 640px) {

}

@media (min-width: 768px) {

  .tp-navigation-results {
    grid-template-columns: repeat(3, 1fr);
  }

  .tp-navigation-nodes .tp-node-name {
    width: calc( ( 100dvw - (var(--size-md) * 4) - var(--navigation-rail-width) ) );
  }

  .tp-navigation-results .tp-node-name {
    width: calc( ( 100dvw - (var(--size-md) * 8) - (var(--gap-medium) * 2) - var(--navigation-rail-width) ) / 3 );
  }

  /** FLEX VERSION */
  .tp-navigation-nodes.flex .tp-node-image {
    width: calc( ( 100dvw - (var(--size-md) * 6) - (var(--gap-medium) * 5) - var(--navigation-rail-width) ) / 6 );
  }

  /** terminal node is optimized for two cards next to each other while both cards have 1 image */
  .tp-navigation-nodes.flex.terminal .tp-node-image, .tp-navigation-nodes.flex.terminal .tp-node-name {
    width: calc( ( 100dvw - (var(--size-md) * 10) - (var(--gap-medium) * 3) - var(--navigation-rail-width) ) / 4 );
  }

  /** max-images-1: 3 cols */
  .tp-navigation-nodes.max-images-1 {
    grid-template-columns: repeat(3, 1fr);
  }

  .tp-navigation-nodes.max-images-1 .tp-node-name {
    width: calc( ( 100dvw - (var(--size-md) * 8) - (var(--gap-medium) * 2) - var(--navigation-rail-width) ) / 3 );
  }
}

/**
* 1024px
* - default: 2 species columns, 3 image columns
*/
@media (min-width: 1024px) {

  .tp-navigation-nodes  {
    grid-template-columns: repeat(2, 1fr);
  }

  .tp-navigation-nodes .tp-node-name {
    width: calc( ( 100dvw - (var(--size-md) * 6) - var(--gap-medium) - var(--navigation-rail-width) ) / 2);
  }

  .tp-navigation-results  {
    grid-template-columns: repeat(6, 1fr);
  }

  .tp-navigation-results .tp-node-name {
    width: calc( ( 100dvw - (var(--size-md) * 14) - (var(--gap-medium) * 5) - var(--navigation-rail-width) ) / 6 );
  }

  .tp-navigation-nodes .tp-node-images {
    grid-template-columns: repeat(3, 1fr);
  }

  /** max-images-1: 4 cols */
  .tp-navigation-nodes.max-images-1 {
    grid-template-columns: repeat(4, 1fr);
  }

  .tp-navigation-nodes.max-images-1 .tp-node-name {
    width: calc( ( 100dvw - (var(--size-md) * 10) - (var(--gap-medium) * 3) - var(--navigation-rail-width) ) / 4 );
  }

  /** FLEX VERSION */
  .tp-navigation-nodes.flex .tp-node-images {
    display: flex;
  }
  .tp-navigation-nodes.flex .tp-node-image {
    width: calc( ( 100dvw - (var(--size-md) * 8) - (var(--gap-medium) * 2) - var(--navigation-rail-width) ) / 6 );
  }
}

@media (min-width: 1280px) {

  .tp-navigation-nodes .tp-node-name {
    width: calc( ( 1280px - (var(--size-md) * 6) - var(--gap-medium) ) / 2);
  }

  .tp-navigation-results .tp-node-name {
    width: calc( ( 1280px - (var(--size-md) * 14) - (var(--gap-medium) * 5) ) / 6 );
  }

  .tp-navigation-nodes.terminal, .tp-navigation-nodes.max-images-1 {
    grid-template-columns: repeat(4, 1fr);
  }

  /** maximum of 2 images: 3 cards with 2 images each */
  .tp-navigation-nodes.max-images-2 {
    grid-template-columns: repeat(3, 1fr);
  }

  .tp-navigation-nodes.max-images-2 .tp-node-images {
    grid-template-columns: repeat(2, 1fr);
  }

  .tp-navigation-nodes.max-images-2 .tp-node-name {
    width: calc( ( 1280px - (var(--size-md) * 8) - (var(--gap-medium) * 3) ) / 3 );
  }

  /** Flex version: optimized for two cards of 3 images each */
  .tp-navigation-nodes.flex .tp-node-image {
    width: calc( ( 1280px - (var(--size-md) * 6) - (var(--gap-medium) * 5) ) / 6 );
  }

  /** terminal node is optimized for 6 cards next to each other */
  .tp-navigation-nodes.flex.terminal .tp-node-image, .tp-navigation-nodes.flex.terminal .tp-node-name {
    width: calc( ( 1280px - (var(--size-md) * 14) - (var(--gap-medium) * 5) ) / 6 );
  }

  /** max-images-1: 5 cols */
  .tp-navigation-nodes.max-images-1 {
    grid-template-columns: repeat(5, 1fr);
  }

  .tp-navigation-nodes.max-images-1 .tp-node-name {
    width: calc( ( 1280px - (var(--size-md) * 12) - (var(--gap-medium) * 5) ) / 5 );
  }
}

@media (min-width: 1536px) {

}
</style>