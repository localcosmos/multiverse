<script setup lang="ts">
import type { ReadOnlyDataset } from 'localcosmos-client';
import { PhX } from '@phosphor-icons/vue';

import DisplayName from '@/components/ui/DisplayName.vue';
import LocalDate from '@/components/ui/LocalDate.vue';
import TaxonName from '@/components/ui/TaxonName.vue';

const props = defineProps<{
  popupObservations: ReadOnlyDataset[],
  open: boolean,
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const closeOverlay = () => {
  emit('close');
};

</script>

<template>
  <div class="ol-popup">
    <div
      class="popup-closer"
      @click="closeOverlay"
    >
      <PhX size="22" />
    </div>
    <div
      class="popup-content"
    >
      <div
        v-for="observation in popupObservations"
        :key="observation.uuid"
      >
        <div>
          <div class="flex flex-col flex-wrap gap-sm">
            <div
              v-if="observation.imageUrl"
              :style="`background-image:url(${observation.imageUrl['1x']})`"
              class="popup-observation-picture"
            >
              &nbsp;
            </div>
            <div class="taxon-name">
              <TaxonName
                :taxon-latname="observation.taxonLatname"
                :taxon-author="observation.taxonAuthor"
                :single-line="true"
              />
            </div>
          </div>
          <div class="popup-user">
            {{ $t('observationDetail.reportedBy') }}
            <DisplayName :user="observation.user" /> <br>
            <LocalDate
              :date="observation.timestamp"
            />
          </div>
          <div class="text-right">
            <RouterLink :to="{ name: 'observation-detail', params: { uuid: observation.uuid }}">
              {{ $t('observationDetail.details') }}
            </RouterLink>
          </div>
        </div>
        <hr>
      </div>
    </div>
  </div>
</template>

<style scoped>

.taxon-name {
  width: 100%;
}

.ol-popup {
  position: absolute;
  background-color: white;
  box-shadow: 0 1px 4px rgba(0,0,0,0.2);
  border-radius: 10px;
  border: 1px solid #cccccc;
  bottom: 20px;
  left: -49px;
  width: 200px;
  min-height: 50px;
}

.ol-popup:after, .ol-popup:before {
  top: 100%;
  border: solid transparent;
  content: " ";
  height: 0;
  width: 0;
  position: absolute;
  pointer-events: none;
}
.ol-popup:after {
  border-top-color: white;
  border-width: 10px;
  left: 48px;
  margin-left: -10px;
}
.ol-popup:before {
  border-top-color: #cccccc;
  border-width: 11px;
  left: 48px;
  margin-left: -11px;
}

.ol-popup a {
  color: var(--color-primary);
}

.popup-closer {
  position: absolute;
  top: 8px;
  right: 8px;
  cursor: pointer;
}

.popup-content {
  font-size: .9rem;
  padding: 16px 16px 16px 16px;
}

.popup-content .popup-date {
  font-size: .7rem;
}

.popup-link {
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  font-size: .8rem;
  padding: 8px 0px 12px 0px;
}

.popup-user {
  font-size: var(--font-size-sm);
  margin: 8px 0px;
}

.ol-popup .popup-observation-picture {
  width: 50px;
  aspect-ratio: 1/1;
  background-size: cover;
}
</style>