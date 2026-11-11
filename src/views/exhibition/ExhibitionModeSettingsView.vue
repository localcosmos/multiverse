<script setup lang="ts">
import { ref, inject, watch } from 'vue';
import { PhTrash, PhArrowUp, PhArrowDown, PhPlus } from '@phosphor-icons/vue';
import GradientContainer from '@/components/container/GradientContainer.vue';
import TaxonName from '@/components/ui/TaxonName.vue';
import ColorButton from '@/components/ui/ColorButton.vue';
import PinKeypadModal from '@/components/modals/PinKeypadModal.vue';
import { useExhibitionModeStore } from '@/stores/exhibition-mode';
import type { TaxonProfiles, SearchTaxon } from 'localcosmos-client';

const exhibitionStore = useExhibitionModeStore();
const taxonProfiles = inject('taxonProfiles') as TaxonProfiles;

// --- pin modal ---
const pinModalOpen = ref(false);
const pinModalMode = ref<'activate' | 'deactivate'>('activate');
const pinModalError = ref<string | null>(null);
const pinModalSubmitting = ref(false);

function openActivate() {
  pinModalMode.value = 'activate';
  pinModalError.value = null;
  pinModalOpen.value = true;
}

function openDeactivate() {
  pinModalMode.value = 'deactivate';
  pinModalError.value = null;
  pinModalOpen.value = true;
}

async function onPinConfirm(pin: string) {
  pinModalSubmitting.value = true;
  pinModalError.value = null;

  if (pinModalMode.value === 'activate') {
    await exhibitionStore.enable(pin);
    pinModalOpen.value = false;
  } else {
    const ok = await exhibitionStore.disable(pin);
    if (ok) {
      pinModalOpen.value = false;
    } else {
      pinModalError.value = 'exhibitionMode.errorWrongPassword';
    }
  }

  pinModalSubmitting.value = false;
}

// --- species search + picker ---
const searchText = ref('');
const searchResults = ref<SearchTaxon[]>([]);

watch(searchText, (query) => {
  if (query.length >= 2) {
    searchResults.value = taxonProfiles.search(query);
  } else {
    searchResults.value = [];
  }
});

const addSpecies = (taxon: SearchTaxon) => {
  exhibitionStore.addSpecies(taxon);
  searchText.value = '';
  searchResults.value = [];
};

const isAlreadyAdded = (taxon: SearchTaxon) =>
  exhibitionStore.species.some((s) => s.nameUuid === taxon.nameUuid);
</script>

<template>
  <GradientContainer>
    <div class="container min-h-100 page-padding-bottom">
      <div class="page-padding-x desktop-header-padding-top">
        <div class="pt-2xl">
          <h1>{{ $t('pageTitles.ExhibitionModeSettings') }}</h1>
        </div>
      </div>

      <!-- Enable / Disable -->
      <div class="settings-section mt-2xl">
        <div class="settings-section-label font-size-md">
          {{ $t('exhibitionMode.sectionActivation') }}
        </div>

        <div class="ex-form page-padding-x">
          <div v-if="exhibitionStore.isActive" class="ex-status-badge ex-status-badge--active font-size-md">
            {{ $t('exhibitionMode.statusActive') }}
          </div>
          <div v-else class="ex-status-badge ex-status-badge--inactive font-size-md">
            {{ $t('exhibitionMode.statusInactive') }}
          </div>

          <template v-if="!exhibitionStore.isActive">
            <div class="ex-btn-wrap">
              <ColorButton
                :text="$t('exhibitionMode.enableButton')"
                size="medium"
                type="success"
                @click="openActivate"
              />
            </div>
          </template>

          <template v-else>
            <p class="font-size-md ex-hint">{{ $t('exhibitionMode.disableHint') }}</p>
            <div class="ex-btn-wrap">
              <ColorButton
                :text="$t('exhibitionMode.disableButton')"
                size="medium"
                type="danger"
                @click="openDeactivate"
              />
            </div>
          </template>
        </div>
      </div>

      <PinKeypadModal
        v-model="pinModalOpen"
        :mode="pinModalMode"
        :error="pinModalError ? $t(pinModalError) : null"
        :submitting="pinModalSubmitting"
        @confirm="onPinConfirm"
      />

      <!-- Title -->
      <div class="settings-section mt-xl">
        <div class="settings-section-label font-size-md">
          {{ $t('exhibitionMode.sectionTitle') }}
        </div>
        <div class="page-padding-x ex-search-section">
          <input
            :value="exhibitionStore.title"
            type="text"
            class="ex-input"
            :disabled="exhibitionStore.isActive"
            :placeholder="$t('exhibitionMode.titlePlaceholder')"
            @input="exhibitionStore.setTitle(($event.target as HTMLInputElement).value)"
          />
        </div>
      </div>

      <!-- Species management -->
      <div class="settings-section mt-xl">
        <div class="settings-section-label font-size-md">
          {{ $t('exhibitionMode.sectionSpecies') }}
        </div>

        <!-- Search / add -->
        <div class="page-padding-x ex-search-section">
          <div v-if="exhibitionStore.isActive" class="alert alert-info mb-md">
            {{ $t('exhibitionMode.speciesListLocked') }}
          </div>

          <input
            v-model="searchText"
            type="text"
            class="ex-input"
            :disabled="exhibitionStore.isActive"
            :placeholder="$t('exhibitionMode.searchSpeciesPlaceholder')"
          />

          <div v-if="searchResults.length > 0" class="ex-search-results mt-sm">
            <div
              v-for="taxon in searchResults"
              :key="taxon.nameUuid"
              class="ex-search-result"
            >
              <div class="ex-search-result__name">
                <span>{{ taxon.name }}</span>
                <span class="ex-search-result__latname font-size-md">{{ taxon.taxonLatname }}</span>
              </div>
              <button
                class="ex-icon-btn"
                :disabled="isAlreadyAdded(taxon) || exhibitionStore.isActive"
                @click="addSpecies(taxon)"
              >
                <PhPlus :size="20" />
              </button>
            </div>
          </div>
        </div>

        <!-- Current species list -->
        <div v-if="exhibitionStore.species.length > 0" class="ex-species-list mt-md page-padding-x">
          <div
            v-for="(entry, index) in exhibitionStore.species"
            :key="entry.nameUuid"
            class="ex-species-item"
          >
            <div class="ex-species-item__order">
              <button
                class="ex-icon-btn"
                :disabled="index === 0 || exhibitionStore.isActive"
                @click="exhibitionStore.moveSpecies(index, index - 1)"
              >
                <PhArrowUp :size="18" />
              </button>
              <button
                class="ex-icon-btn"
                :disabled="index === exhibitionStore.species.length - 1 || exhibitionStore.isActive"
                @click="exhibitionStore.moveSpecies(index, index + 1)"
              >
                <PhArrowDown :size="18" />
              </button>
            </div>
            <TaxonName
              class="ex-species-item__name"
              :taxon-latname="entry.taxonLatname"
              :taxon-author="entry.taxonAuthor"
              :vernacular-name="entry.name"
              single-line
            />
            <button class="ex-icon-btn ex-icon-btn--danger" :disabled="exhibitionStore.isActive" @click="exhibitionStore.removeSpecies(entry.nameUuid)">
              <PhTrash :size="20" />
            </button>
          </div>
        </div>

        <p v-else class="page-padding-x font-size-md ex-hint mt-md">
          {{ $t('exhibitionMode.noSpeciesAdded') }}
        </p>
      </div>
    </div>
  </GradientContainer>
</template>

<style>
@layer defaults {
  :root {
    --exmode-color-icon: #000;
    --exmode-search-result-bg: #555;

    --darkmode-exmode-color-icon: #fff;
    --darkmode-exmode-search-result-bg: #555;
  }
}

.ex-btn-wrap {
  display: inline-block;
}

.ex-form {
  padding-top: var(--size-md);
  padding-bottom: var(--size-md);
  display: flex;
  flex-direction: column;
  gap: var(--size-sm);
  max-width: 480px;
}

.ex-status-badge {
  display: inline-block;
  align-self: flex-start;
  padding: var(--size-xs) var(--size-md);
  border-radius: 2em;
  font-weight: 600;
}

.ex-status-badge--active {
  background: var(--color-success);
  color: #fff;
}

.ex-status-badge--inactive {
  background: rgba(128, 128, 128, 0.2);
}

.ex-hint {
  opacity: 0.7;
  line-height: 1.4;
}

.ex-search-section {
  max-width: 480px;
}

.ex-input {
  width: 100%;
  height: 50px;
  padding: 0 15px;
  font-size: 0.9rem;
  border-radius: 6px;
  border: var(--form-field-border);
  background: #fff;
  outline: none;
  color: var(--primary-dark);
  box-sizing: border-box;
}

body.dark .ex-input {
  color: #000;
}

.ex-input:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.ex-input:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.ex-search-results {
  border: 1px solid rgba(128, 128, 128, 0.2);
  border-radius: var(--border-radius, 8px);
  overflow: hidden;
}

.ex-search-result {
  display: flex;
  align-items: center;
  gap: var(--size-sm);
  padding: var(--size-sm) var(--size-md);
  border-bottom: 1px solid rgba(128, 128, 128, 0.15);
  background: var(--exmode-search-result-bg);
}

body.dark .ex-search-result {
  background: var(--darkmode-exmode-search-result-bg);
}


.ex-search-result:last-child {
  border-bottom: none;
}

.ex-search-result__name {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.ex-search-result__latname {
  opacity: 0.6;
  font-style: italic;
}

.ex-species-list {
  display: flex;
  flex-direction: column;
}

.ex-species-item {
  display: flex;
  align-items: center;
  gap: var(--size-sm);
  padding: var(--size-sm) 0;
  border-bottom: 1px solid rgba(128, 128, 128, 0.15);
}

.ex-species-item__order {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.ex-species-item__name {
  flex: 1;
  font-weight: 500;
}

.ex-icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  background: transparent;
  border-radius: 50%;
  cursor: pointer;
  opacity: 0.8;
  transition: opacity 0.15s;
  flex-shrink: 0;
  color: var(--exmode-color-icon);
}

body.dark .ex-icon-btn {
  color: var(--darkmode-exmode-color-icon);
}

.ex-icon-btn:disabled {
  opacity: 0.25;
  cursor: default;
}

.ex-icon-btn--danger:not(:disabled):hover {
  color: var(--color-danger);
}
</style>
