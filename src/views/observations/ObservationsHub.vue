<script setup lang="ts">
import { ref, inject, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import type {
  Features,
  LocalCosmosApi,
  DatasetListEntry,
  DatasetListResponse,
} from 'localcosmos-client';
import { LCApiResultTypes } from 'localcosmos-client';
import type { Dataset as IdbDataset } from '@/database/db';
import { PhNotePencil, PhMapTrifold, PhArrowRight } from '@phosphor-icons/vue';

import ContentContainer from '@/components/container/ContentContainer.vue';
import HorizontalScroll from '@/components/container/HorizontalScroll.vue';
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue';
import DatasetCard from '@/components/datasets/DatasetCard.vue';
import ObservationSpotlightCard from '@/components/datasets/ObservationSpotlightCard.vue';

import { usePermissionsStore } from '@/stores/permissions';
import { useRemoteDatasets } from '@/composables/datasets/useRemoteDatasets';
import { useIdbDatasets } from '@/composables/datasets/useIdbDatasets';

const router = useRouter();
const features = inject('features') as Features;
const LCApi = inject('LCApi') as LocalCosmosApi;
const permissions = usePermissionsStore();
const { getRemoteUserDatasets, getRemoteDatasetImage } = useRemoteDatasets();
const { getUnsyncedDatasets, getTaxonFromDataset, getDateFromDataset, getDatasetImage } =
  useIdbDatasets();

const recentLoading = ref(true);
const recentObservations = ref<DatasetListEntry[]>([]);

const myLoading = ref(true);
const unsyncedObservations = ref<IdbDataset[]>([]);
const myServerObservations = ref<DatasetListEntry[]>([]);
const idbDatasetImages = ref<Map<string, string>>(new Map());

const RECENT_LIMIT = 7;
const MY_LIMIT = 6;

const spotlightObservation = computed(() => recentObservations.value[0] ?? null);
const recentStripObservations = computed(() => recentObservations.value.slice(1));

const hasMyObservations = computed(
  () => unsyncedObservations.value.length > 0 || myServerObservations.value.length > 0,
);

const relativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });
  if (diffMins < 1) return rtf.format(0, 'second');
  if (diffMins < 60) return rtf.format(-diffMins, 'minute');
  if (diffHours < 24) return rtf.format(-diffHours, 'hour');
  if (diffDays < 7) return rtf.format(-diffDays, 'day');
  return date.toLocaleDateString();
};

const getIdbImage = (uuid: string) => idbDatasetImages.value.get(uuid) ?? '';

const newObservation = () => {
  if (permissions.canUseDatasets && features.GenericForm) {
    router.push({
      name:
        features.GenericForm.list.length === 1
          ? 'observation-form'
          : 'observation-forms-list',
    });
  }
};

const loadRecentObservations = async () => {
  recentLoading.value = true;
  const result = await LCApi.getDatasets(RECENT_LIMIT, 0);
  if (result?.type === LCApiResultTypes.success) {
    recentObservations.value = (result.data as DatasetListResponse).results;
  }
  recentLoading.value = false;
};

const loadMyObservations = async () => {
  myLoading.value = true;
  const unsynced = await getUnsyncedDatasets();
  unsyncedObservations.value = unsynced;
  for (const dataset of unsynced) {
    try {
      idbDatasetImages.value.set(dataset.uuid, await getDatasetImage(dataset));
    } catch {
      idbDatasetImages.value.set(dataset.uuid, '');
    }
  }
  const result = await getRemoteUserDatasets(MY_LIMIT, 0);
  if (result?.type === LCApiResultTypes.success) {
    myServerObservations.value = (result.data as DatasetListResponse).results;
  }
  myLoading.value = false;
};

onMounted(() => {
  loadRecentObservations();
  if (permissions.canUseDatasets) {
    loadMyObservations();
  }
});
</script>

<template>
  <ContentContainer>
    <div class="page observations-hub">
      <div class="subheader-page-padding container">

        <!-- New Observation CTA -->
        <div v-if="permissions.canUseDatasets" class="hub-cta">
          <button class="hub-cta-btn" @click="newObservation">
            <PhNotePencil :size="20" weight="bold" />
            {{ $t('navigation.NewObservation') }}
          </button>
        </div>

        <!-- Recently observed -->
        <section class="hub-section">
          <div class="hub-section-header">
            <h2 class="hub-section-title">{{ $t('Recently observed') }}</h2>
            <RouterLink :to="{ name: 'map' }" class="hub-see-all nolinkstyle">
              {{ $t('navigation.Map') }}
              <PhArrowRight :size="13" weight="bold" />
            </RouterLink>
          </div>

          <div v-if="recentLoading" class="hub-spinner">
            <LoadingSpinner />
          </div>
          <template v-else-if="recentObservations.length">
            <RouterLink
              v-if="spotlightObservation"
              :to="{ name: 'observation-detail', params: { uuid: spotlightObservation.uuid } }"
              class="nolinkstyle"
            >
              <ObservationSpotlightCard
                :observation="spotlightObservation"
                :relative-time="relativeTime(spotlightObservation.timestamp)"
              />
            </RouterLink>

            <HorizontalScroll v-if="recentStripObservations.length" class="hub-strip">
              <div
                v-for="obs in recentStripObservations"
                :key="obs.uuid"
                class="hub-strip-card"
              >
                <RouterLink
                  :to="{ name: 'observation-detail', params: { uuid: obs.uuid } }"
                  class="nolinkstyle"
                >
                  <DatasetCard
                    :uuid="obs.uuid"
                    :taxon="obs.taxon"
                    :image="getRemoteDatasetImage(obs)"
                    :date="new Date(obs.timestamp)"
                  />
                </RouterLink>
              </div>
            </HorizontalScroll>
          </template>
          <p v-else class="hub-empty">{{ $t('myObservations.noObservationsYet') }}</p>
        </section>

        <!-- My observations -->
        <section v-if="permissions.canUseDatasets" class="hub-section">
          <div class="hub-section-header">
            <h2 class="hub-section-title">{{ $t('navigation.MyObservations') }}</h2>
            <div class="hub-section-header-end">
              <span v-if="unsyncedObservations.length" class="hub-unsynced-badge">
                {{ unsyncedObservations.length }} {{ $t('unsynced') }}
              </span>
              <RouterLink :to="{ name: 'my-observations' }" class="hub-see-all nolinkstyle">
                {{ $t('See all') }}
                <PhArrowRight :size="13" weight="bold" />
              </RouterLink>
            </div>
          </div>

          <div v-if="myLoading" class="hub-spinner">
            <LoadingSpinner />
          </div>
          <p v-else-if="!hasMyObservations" class="hub-empty">
            {{ $t('myObservations.noObservationsYet') }}
          </p>
          <HorizontalScroll v-else class="hub-strip">
            <div
              v-for="dataset in unsyncedObservations"
              :key="dataset.uuid"
              class="hub-strip-card hub-strip-card--unsynced"
            >
              <RouterLink
                :to="{ name: 'edit-local-observation', params: { uuid: dataset.uuid } }"
                class="nolinkstyle"
              >
                <DatasetCard
                  :uuid="dataset.uuid"
                  :taxon="getTaxonFromDataset(dataset.observationForm, dataset.data)"
                  :image="getIdbImage(dataset.uuid)"
                  :date="getDateFromDataset(dataset.observationForm, dataset.data)"
                />
              </RouterLink>
            </div>
            <div
              v-for="dataset in myServerObservations"
              :key="dataset.uuid"
              class="hub-strip-card"
            >
              <RouterLink
                :to="{ name: 'edit-remote-observation', params: { uuid: dataset.uuid } }"
                class="nolinkstyle"
              >
                <DatasetCard
                  :uuid="dataset.uuid"
                  :taxon="dataset.taxon"
                  :image="getRemoteDatasetImage(dataset)"
                  :date="new Date(dataset.timestamp)"
                />
              </RouterLink>
            </div>
          </HorizontalScroll>
        </section>

        <!-- Map link -->
        <div class="hub-map-link">
          <RouterLink :to="{ name: 'map' }" class="nolinkstyle">
            <div class="hub-map-link-row">
              <PhMapTrifold :size="18" />
              <span>{{ $t('Explore on the map') }}</span>
              <PhArrowRight :size="14" weight="bold" />
            </div>
          </RouterLink>
        </div>

      </div>
    </div>
  </ContentContainer>
</template>

<style>
@layer defaults {
  :root {
    --observations-hub-bg: #f0f0f0;
    --darkmode-observations-hub-bg: #1a1a1a;
    --hub-unsynced-badge-bg: var(--color-accent-1, #d6b15c);
    --hub-unsynced-badge-color: #fff;
    --hub-see-all-color: var(--color-secondary, rgb(84, 126, 138));
    --hub-map-link-color: var(--color-secondary, rgb(84, 126, 138));
    --darkmode-hub-see-all-color: var(--color-accent-3, #a9cfd0);
    --darkmode-hub-map-link-color: var(--color-accent-3, #a9cfd0);
  }
}

.observations-hub {
  background-color: var(--observations-hub-bg);
}

body.dark .observations-hub {
  background-color: var(--darkmode-observations-hub-bg);
}

/* CTA */
.hub-cta {
  margin-bottom: var(--size-xl);
}

.hub-cta-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--size-sm);
  width: 100%;
  padding: var(--size-md) var(--size-xl);
  background: var(--colorbutton-primary-bg, var(--color-primary));
  color: var(--colorbutton-primary-color, #fff);
  border: none;
  border-radius: var(--border-radius-sm);
  font-family: var(--font-family-sans);
  font-weight: 700;
  font-size: var(--font-size-lg);
  cursor: pointer;
  box-shadow: var(--box-shadow);
  transition: filter 0.15s ease;
}

.hub-cta-btn:hover {
  filter: brightness(1.1);
}

body.dark .hub-cta-btn {
  background: var(--darkmode-colorbutton-primary-bg, var(--color-primary));
  color: var(--darkmode-colorbutton-primary-color, #fff);
}

/* Section */
.hub-section {
  margin-bottom: var(--size-3xl);
}

.hub-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--gap-medium);
  margin-bottom: var(--size-md);
}

.hub-section-title {
  font-size: var(--font-size-xl);
  font-weight: 700;
  margin: 0;
}

.hub-section-header-end {
  display: flex;
  align-items: center;
  gap: var(--size-sm);
}

.hub-unsynced-badge {
  font-size: var(--font-size-sm);
  font-weight: 600;
  background: var(--hub-unsynced-badge-bg);
  color: var(--hub-unsynced-badge-color);
  border-radius: 100px;
  padding: 2px var(--size-sm);
  white-space: nowrap;
}

.hub-see-all {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: var(--font-size-md);
  font-weight: 600;
  color: var(--hub-see-all-color);
  white-space: nowrap;
}

body.dark .hub-see-all {
  color: var(--darkmode-hub-see-all-color);
}

/* Strip */
.hub-strip {
  margin-top: var(--size-md);
}

.hub-strip-card {
  width: 140px;
  flex-shrink: 0;
}

.hub-strip-card--unsynced {
  position: relative;
  opacity: 0.85;
}

.hub-strip-card--unsynced::after {
  content: '';
  position: absolute;
  top: 6px;
  right: 6px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-accent-1, #d6b15c);
  z-index: 1;
}

/* Loading / empty */
.hub-spinner {
  display: flex;
  justify-content: center;
  padding: var(--size-xl) 0;
}

.hub-empty {
  font-size: var(--font-size-md);
  color: var(--color-text-muted);
  padding: var(--size-lg) 0;
  margin: 0;
}

/* Map link */
.hub-map-link {
  padding: var(--size-md) 0 var(--size-xl);
  border-top: 1px solid rgba(128, 128, 128, 0.2);
}

.hub-map-link-row {
  display: inline-flex;
  align-items: center;
  gap: var(--size-sm);
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--hub-map-link-color);
}

body.dark .hub-map-link-row {
  color: var(--darkmode-hub-map-link-color);
}

@media (min-width: 640px) {
  .hub-strip-card {
    width: 160px;
  }
}

@media (min-width: 768px) {
  .hub-strip-card {
    width: 180px;
  }
}
</style>
