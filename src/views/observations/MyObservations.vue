<script setup lang="ts">
import { ref, inject, onMounted } from 'vue';
import { useIdbDatasets } from '@/composables/datasets/useIdbDatasets';
import { useRemoteDatasets } from '@/composables/datasets/useRemoteDatasets';
import ContentContainer from '@/components/container/ContentContainer.vue';
import type { NamedDatasetListEntry } from '@/types/datasets';
import type { Dataset as idbDataset } from '@/database/db';
import DatasetCard from '@/components/datasets/DatasetCard.vue';
import { LCApiResultTypes } from 'localcosmos-client';
import type { DatasetListResponse, BackboneTaxonomy } from 'localcosmos-client';
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue';
import SyncObservationsModal from '@/components/modals/SyncObservationsModal.vue';
import { parseServerErrors, parseServerErrorsToString } from '@/composables/parseServerErrors';

const backboneTaxonomy = inject('backboneTaxonomy') as BackboneTaxonomy;

const { getUnsyncedDatasets, getTaxonFromDataset, getDateFromDataset, getDatasetImage } = useIdbDatasets();
const { getRemoteUserDatasets, getRemoteDatasetImage } = useRemoteDatasets();

const unsyncedObservations = ref<idbDataset[]>([]);
const loadingUnsynced = ref<boolean>(true);

const idbDatasetImages = ref<Map<string, string>>(new Map());

const loadingServerObservations = ref<boolean>(false);
const serverObservations = ref<NamedDatasetListEntry[]>([]);
const serverObservationsError = ref<string | null>(null);
const currentPage = ref<number>(1);
const totalCount = ref<number>(0);

const LIMIT = 10;

const loadDatasetImages = async () => {
  for (const dataset of unsyncedObservations.value) {
    try {
      const imageUrl = await getDatasetImage(dataset);
      idbDatasetImages.value.set(dataset.uuid, imageUrl);
    } catch (error) {
      console.warn(`Failed to load image for dataset ${dataset.uuid}:`, error);
      idbDatasetImages.value.set(dataset.uuid, ''); // Set empty string as fallback
    }
  }
};

const getIdbDatasetTaxon = (idbDataset: idbDataset) => {
  return getTaxonFromDataset(idbDataset.observationForm, idbDataset.data);
}

const getIdbDatasetDate = (idbDataset: idbDataset): Date | null => {
  return getDateFromDataset(idbDataset.observationForm, idbDataset.data);
}

const getIdbDatasetImageSync = (idbDataset: idbDataset): string => {
  return idbDatasetImages.value.get(idbDataset.uuid) || '';
}

const getMyObservations = async (page: number) => {

  loadingServerObservations.value = false;

  const offset = LIMIT * (page-1);

  const parsedObservations: NamedDatasetListEntry[] = [];

  const result = await getRemoteUserDatasets(LIMIT, offset);

  if (result) {
    if (result.type === LCApiResultTypes.success) {
      const data = result.data as DatasetListResponse;
      totalCount.value = result.data.count;

      data.results.forEach((result) => {
        const name = backboneTaxonomy.vernacular(result.taxon.nameUuid);
        const namedResult = result as NamedDatasetListEntry;
        namedResult.name = name;
        parsedObservations.push(namedResult);
      });

      serverObservations.value = parsedObservations;
    } else {
      const errors = parseServerErrorsToString(result.error);
      serverObservationsError.value = errors || 'Unknown error fetching remote datasets';
      console.error('Error fetching remote datasets:', serverObservationsError.value);
    }
  } else {
    console.error('Error fetching remote datasets');

  }

  loadingServerObservations.value = false;
};

const onPageChange = async (page:number) => {
  console.log('Page changed to:', page);
  await getMyObservations(page);
};

const onSyncComplete = async () => {
  loadingUnsynced.value = true;
  const datasets = await getUnsyncedDatasets();
  unsyncedObservations.value = datasets;
  loadingUnsynced.value = false;

  currentPage.value = 1;
  await getMyObservations(1);
};

onMounted( async () => {
  // load datasets from indexedDB
  const datasets = await getUnsyncedDatasets();
  unsyncedObservations.value = datasets;

  await loadDatasetImages();

  loadingUnsynced.value = false;

  await getMyObservations(1);
});

</script>

<template>
  <ContentContainer>
    <div class="page page-padding">
      <div class="container">
        <div class="mb-xl">
          <SyncObservationsModal @sync-complete="onSyncComplete" />
        </div>
        <div v-if="unsyncedObservations && !loadingUnsynced" class="local-observations">
          <h1 class="h1 mb-xl">
            {{ $t('myObservations.unsyncedObservations') }}
          </h1>
          <div class="dataset-list">
            <RouterLink
              v-for="dataset in unsyncedObservations"
              :key="dataset.uuid"
              :to="{ name: 'edit-local-observation', params: { uuid: dataset.uuid } }"
              class="nolinkstyle"
            >
              <DatasetCard
                :uuid="dataset.uuid"
                :is-idb-dataset="true"
                :taxon="getIdbDatasetTaxon(dataset)"
                :image="getIdbDatasetImageSync(dataset)"
                :date="getIdbDatasetDate(dataset)"
              />
            </RouterLink>
          </div>
          <div v-if="unsyncedObservations.length === 0" class="flex">
            {{ $t('sync.noUnsyncedObservations') }}
          </div>
        </div>
        <div class="server-observations my-xl">
          <h1 class="h1 mb-xl">
            {{ $t('myObservations.serverObservations') }}
          </h1>
          <div v-if ="loadingServerObservations">
            <LoadingSpinner />
          </div>
          <div v-else>
            <div v-if="serverObservations.length">
              <div class="dataset-list mb-xl">
                <RouterLink
                  v-for="(dataset, index) in serverObservations"
                  :key="index"
                  :to="{ name: 'edit-remote-observation', params: { uuid: dataset.uuid } }"
                  class="nolinkstyle"
                >
                  <DatasetCard
                    :uuid="dataset.uuid"
                    :taxon="dataset.taxon"
                    :image="getRemoteDatasetImage(dataset)"
                    :date="new Date(dataset.timestamp)"
                    :username="dataset.user ? dataset.user.username : null"
                  />
                </RouterLink>
              </div>
              <div class="pagination">
                <vue-awesome-paginate
                  v-model="currentPage"
                  :total-items="totalCount"
                  :items-per-page="LIMIT"
                  :max-pages-shown="1"
                  @click="onPageChange"
                  :show-jump-buttons="false"
                  :show-breakpoint-buttons="true"
                />
              </div>
            </div>
            <div v-else class="flex">
              <div v-if="serverObservationsError" class="alert alert-warning">
                <span class="error-message">{{ serverObservationsError }}</span>
              </div>
              <div v-else>
                {{ $t('myObservations.noObservationsYet') }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </ContentContainer>
</template>

<style scoped>
.dataset-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--gap-medium);
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
}


@media (min-width: 640px) {
  .dataset-list {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 768px) {
  .dataset-list {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (min-width: 1024px) {
  .dataset-list {
    grid-template-columns: repeat(5, 1fr);
  }
}

@media (min-width: 1280px) {
  .dataset-list {
    grid-template-columns: repeat(6, 1fr);
  }
}

@media (min-width: 1536px) {
}

</style>