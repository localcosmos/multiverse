<script setup lang="ts">
import { ref, inject, onMounted } from 'vue';
import { transform } from 'ol/proj';
import { LCApiResultTypes } from 'localcosmos-client';
import type { GenericForm, ReadOnlyDataset, LocalCosmosApi } from 'localcosmos-client';
import { useRoute } from 'vue-router';
import WorldMap from '@/map/WorldMap';
import OnlinePage from '@/components/container/OnlinePage.vue';
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue';
import ReadOnlyField from '@/components/forms/fields/ReadOnlyField.vue';
import UserCard from '@/components/ui/UserCard.vue';

const LCApi = inject('LCApi') as LocalCosmosApi;

const route = useRoute();
const observationUuid = route.params.uuid as string;

const loading = ref<boolean>(true);

const observationForm = ref<GenericForm|null>(null);
const dataset = ref<ReadOnlyDataset|null>(null);

onMounted(async () => {
  const response = await LCApi.getDataset(observationUuid);

  if (response.type === LCApiResultTypes.success) {
    const observationFormUuid = response.data.observationForm.uuid;
    const observationFormVersion = response.data.observationForm.version;

    const observationFormResponse = await LCApi.getObservationForm(observationFormUuid, observationFormVersion);

    if (observationFormResponse.type === LCApiResultTypes.success) {
      observationForm.value = observationFormResponse.data.definition;
      dataset.value = response.data;

      const coords3857 = response.data.coordinates.geometry.coordinates;
      const coords4326 = transform(coords3857, 'EPSG:3857', 'EPSG:4326');

      setTimeout(function () {
        const worldMap = new WorldMap('observationMap', coords4326[0], coords4326[1], 14);
        worldMap.drawMarker(coords3857[0], coords3857[1], true);
      }, 250);
    }
    loading.value = false;
  }
});
</script>

<template>
  <OnlinePage>
    <div class="page page-padding">
      <div v-if="loading">
        <LoadingSpinner />
      </div>
      <div v-else class="container">
        <div v-if="dataset && observationForm">
          <h1 class="h1 mb-xl">
            {{ $t(observationForm.name) }}
          </h1>
          <div
            class="observation-data"
          >
            <div class="observation-form-fields">
              <div
                v-for="field in observationForm.fields"
                :key="field.uuid"
              >
                <ReadOnlyField
                  v-if="field.uuid != observationForm.geographicReference"
                  :field="field"
                  :dataset="dataset"
                />
              </div>
            </div>
            <div id="observationMap"></div>
          </div>
          <div class="report-user mt-xl">
            <div class="text-muted">
              {{ $t('observationDetail.reportedBy') }}:
            </div>
            <div class="flex">
              <UserCard :user="dataset.user" />
            </div>
          </div>
        </div>
        <div v-else>
          error loading data
        </div>
      </div>
    </div>
  </OnlinePage>
</template>

<style scoped>
.observation-data {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--gap-medium);
}
.observation-form-fields {
  display: flex;
  flex-direction: column;
  gap: var(--gap-medium);
}

#observationMap {
  width: 100%;
  height: 400px;
}
</style>