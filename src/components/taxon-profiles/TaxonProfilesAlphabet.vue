<script setup lang="ts">
import { inject, computed } from "vue";
import { storeToRefs } from "pinia";
import type { TaxonProfiles } from "localcosmos-client";
import LazyRenderer from "@/components/container/LazyRenderer.vue";
import TaxonProfilesSearchResult from "@/components/taxon-profiles/TaxonProfilesSearchResult.vue";
import ImageCard from "@/components/ui/ImageCard.vue";
import TaxonProfileLink from "@/components/ui/TaxonProfileLink.vue";
import { PhSquaresFour, PhList } from "@phosphor-icons/vue";
import { useTabsStore } from "@/stores/tabs";
import { useAppSettingsStore } from "@/stores/app-settings";

const tabsStore = useTabsStore();
const isAlphabetTabActive = computed(() => tabsStore.tabs["taxon-profiles"]?.activeTab === 2);

const appSettingsStore = useAppSettingsStore();
const { taxonProfilesViewMode: viewMode } = storeToRefs(appSettingsStore);
function toggleViewMode() {
  viewMode.value = viewMode.value === "list" ? "grid" : "list";
}

const props = defineProps<{
  selectedLetter: string | null;
}>();

const taxonProfiles = inject("taxonProfiles") as TaxonProfiles;

const startLetterTaxa = computed(() => {
  if (props.selectedLetter) {
    return taxonProfiles.searchVernacular(props.selectedLetter, null, true);
  } else {
    return [];
  }
});
</script>

<template>
  <div class="taxon-profiles-alphabet">
    <Teleport to="body">
      <div v-if="isAlphabetTabActive" class="taxon-profiles-alphabet__view-toggle">
        <button class="taxon-profiles-alphabet__view-toggle-btn" @click="toggleViewMode">
          <PhSquaresFour v-if="viewMode === 'list'" :size="24" />
          <PhList v-else :size="24" />
        </button>
      </div>
    </Teleport>
    <div class="taxon-profiles-alphabet__alphabet-list-container">
      <div
        v-if="selectedLetter"
        :class="[viewMode === 'grid' ? 'taxon-profiles-alphabet__alphabet-grid' : 'taxon-profiles-alphabet__alphabet-list']"
      >
        <template v-if="viewMode === 'list'">
          <LazyRenderer
            v-for="taxon in startLetterTaxa"
            :key="`${taxon.name}-${taxon.nameUuid}`"
            :min-height="60"
          >
            <TaxonProfilesSearchResult :taxon="taxon" />
          </LazyRenderer>
        </template>
        <template v-else>
          <TaxonProfileLink
            v-for="taxon in startLetterTaxa"
            :key="`${taxon.name}-${taxon.nameUuid}`"
            :taxon="taxon"
            class="nolinkstyle"
          >
            <ImageCard :image="taxon.image">
              <div class="taxon-profiles-alphabet__taxon-card-name">{{ taxon.name }}</div>
              <div class="taxon-profiles-alphabet__taxon-card-latname">{{ taxon.taxonLatname }}</div>
              <template #no-image>
                <div class="taxon-profiles-alphabet__taxon-card-no-image">
                  <i>{{ taxon.taxonLatname }}</i>
                </div>
              </template>
            </ImageCard>
          </TaxonProfileLink>
        </template>
        <div v-if="startLetterTaxa.length === 0" class="alert alert-error">
          {{ $t("taxonProfiles.noSpeciesFound") }}
        </div>
      </div>
    </div>
  </div>
</template>

<style>
@layer defaults {
  :root {
    --view-toggle-btn-bg: var(--color-accent-3);
    --view-toggle-btn-color: var(--color-neutral-2);

    --darkmode-view-toggle-btn-bg: var(--color-accent-3);
    --darkmode-view-toggle-btn-color: var(--color-neutral-2);
  }
}

.taxon-profiles-alphabet__view-toggle {
  position: fixed;
  top: calc(var(--header-bar-height) + var(--alphabet-letters-container-height) + var(--size-md));
  right: var(--size-md);
  z-index: 100;
  background: var(--view-toggle-btn-bg);
  padding: 5px;
  border-radius: 50%;
}

body.dark .taxon-profiles-alphabet__view-toggle {
  background: var(--darkmode-view-toggle-btn-bg);
}

.taxon-profiles-alphabet__view-toggle-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  transition: transform 0.1s ease;
  color: var(--view-toggle-btn-color);
}

body.dark .taxon-profiles-alphabet__view-toggle-btn {
  color: var(--darkmode-view-toggle-btn-color);
}

.taxon-profiles-alphabet__view-toggle-btn:active {
  transform: scale(0.85);
}

.taxon-profiles-alphabet__icon-swap-enter-active,
.taxon-profiles-alphabet__icon-swap-leave-active {
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
}

.taxon-profiles-alphabet__icon-swap-enter-from {
  opacity: 0;
  transform: scale(0.6);
}

.taxon-profiles-alphabet__icon-swap-leave-to {
  opacity: 0;
  transform: scale(0.6);
}

.taxon-profiles-alphabet__alphabet-list-container {
  display: flex;
  flex-direction: row;
  justify-content: center;
  padding-top: 40px;
}

.taxon-profiles-alphabet__alphabet-list-container, .taxon-profiles-alphabet__alphabet-list {
  width: 100%;
}

.taxon-profiles-alphabet__alphabet-list {
  display: flex;
  flex-direction: column; /* Default to a single-column layout */
  width: 100%;
  align-items: center;
  padding-left: 0;
  padding-right: 0;
  row-gap: 0;
}

.taxon-profiles-alphabet__alphabet-list > div {
  width: 100%;
  border-bottom: 1px solid rgba(0,0,0,0.1);
}

.taxon-profiles-alphabet__alphabet-grid {
  display: grid !important;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--size-xs);
  row-gap: var(--size-xs);
  flex-direction: unset;
  align-items: unset;
  padding: 0 var(--size-xl);
}

.taxon-profiles-alphabet__taxon-card-name {
  font-weight: bold;
}

.taxon-profiles-alphabet__taxon-card-latname {
  font-style: italic;
  font-size: var(--font-size-md);
  color: var(--color-text-muted);
}

.taxon-profiles-alphabet__taxon-card-no-image {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  aspect-ratio: 1/1;
  color: var(--color-text-muted);
}

@media (min-width: 768px) {
  .taxon-profiles-alphabet__alphabet-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 1024px) {
  .taxon-profiles-alphabet__alphabet-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (min-width: 768px) {
  .taxon-profiles-alphabet__alphabet-list {
    display: grid; /* Switch to grid layout */
    grid-template-columns: repeat(1, 1fr); /* Two columns for medium screens */
  }

  .taxon-profiles-alphabet__alphabet-list {
    width: 100%;
  }

  .taxon-profiles-alphabet__alphabet-grid {
    width: 100%;
  }
}

@media (min-width: 1024px) {
  .taxon-profiles-alphabet__alphabet-list {
    grid-template-columns: repeat(1, 1fr); /* Three columns for large screens */
  }
}

@media (min-width: 1280px) {

  .taxon-profiles-alphabet__alphabet-list {
    grid-template-columns: repeat(1, 1fr);
  }

  .taxon-profiles-alphabet__alphabet-list {
    width: 800px;
  }

  .taxon-profiles-alphabet__alphabet-grid {
    width: 100%;
  }

  .taxon-profiles-alphabet__view-toggle {
    top: calc(var(--desktop-header-bar-height) + var(--desktop-tabs-navigation-height) + var(--alphabet-letters-container-height) + var(--size-md));
    right: calc((100vw - var(--navigation-rail-width) - 1210px) / 2 + var(--size-2xl));
  }
}
</style>
