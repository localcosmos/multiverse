<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { transform } from 'ol/proj';
import type { GenericFormField, GeoJSONFeature } from 'localcosmos-client';
import { pointLatLngToFeature, GenericValueManager } from 'localcosmos-client';
import { t } from 'i18next';
import { useField } from 'vee-validate';
import { useGeolocationStore, GeolocationState } from '@/stores/geolocation';
import { createGenericFieldLabel } from '@/composables/createGenericFieldLabel';
import { PhMapPin, PhGlobeSimple } from '@phosphor-icons/vue';

import VerbosePlaceholderField from '@/components/forms/fields/VerbosePlaceholderField.vue';
import ModalOverlay from '@/components/modals/ModalOverlay.vue';
import { MODAL_TYPES, useModalsStore } from '@/stores/modals';
import SavePositionButton from '@/components/ui/SavePositionButton.vue';
import GPSButton from '@/components/ui/GPSButton.vue';
import GeonameSearch from '@/components/geolocation/GeonameSearch.vue';
import TabButton from '@/components/ui/tabs/TabButton.vue';

import type { GeonameResult, SimpleGeolocationCoordinates, SimpleGeolocationPosition } from '@/types/geolocation';

// OpenLayers
import WorldMap from '@/map/WorldMap';
import ColorButton from '@/components/ui/ColorButton.vue';

const props = defineProps<{
  genericField: GenericFormField,
}>();

const { value, setValue } = useField(() => props.genericField.uuid);

const modals = useModalsStore();
const geolocation = useGeolocationStore();

const label: string = createGenericFieldLabel(props.genericField);
const selectedPoint = ref<GeoJSONFeature | null>(null);
const selectedPosition = ref<SimpleGeolocationPosition|null>(null);
const map = ref<WorldMap | null>(null);

const userSetPosition = ref<boolean>(false);
const geolocationMessage = ref<string>(t('geolocation.waitingForPosition'));
const geolocationError = ref<string>('');

const activeTab = ref<'map' | 'manual'>('map');
const manualLat = ref<string>('');
const manualLng = ref<string>('');
const manualError = ref<string>('');

// sets the selected point, draws a marker
// does NOT abort GPS
const setSelectedPoint = (lng: number, lat: number, accuracy:number) => {
  accuracy = accuracy | 0;

  const xy: number[] = transform([lng, lat], 'EPSG:4326', 'EPSG:3857');

  map.value?.drawMarker(xy[0], xy[1], true);

  const feature = pointLatLngToFeature(lat, lng, 0);
  selectedPoint.value = feature;

  setValue(btoa(JSON.stringify(feature)));

  const coords: SimpleGeolocationCoordinates = {
    latitude: lat,
    longitude: lng,
    accuracy: 0,
    altitude: null,
    heading: null,
    speed: null,
    altitudeAccuracy: null,
  };

  selectedPosition.value = {
    coords: coords,
    timestamp: new Date().getTime(),
  };

  geolocationMessage.value = `${lat.toFixed(3)}N, ${lng.toFixed(3)}E (±${accuracy}m)`;
  geolocationError.value = '';
};

const removeSelectedPoint = () => {
  userSetPosition.value = false;
  setValue(null);
  selectedPosition.value = null;
  selectedPoint.value = null;
  map.value?.clearMarkerLayer();
};

const setManualCoordinates = () => {
  const lat = parseFloat(manualLat.value);
  const lng = parseFloat(manualLng.value);

  if (
    isNaN(lat) ||
    isNaN(lng) ||
    lat < -90 ||
    lat > 90 ||
    lng < -180 ||
    lng > 180
  ) {
    manualError.value = t('validation.invalid');
    return;
  }
  manualError.value = '';
  setSelectedPoint(lng, lat, 0);
  userSetPosition.value = true;
  // Optionally close modal after setting
  modals.closeModal();
};

geolocation.$subscribe((mutation, state) => {
  if (state.error && userSetPosition.value === false) {
    geolocationError.value = t('geolocation.setManually');
    if (state.error.code === 1) {
      geolocationMessage.value = t('geolocation.permissionDenied');
      geolocation.deactivateGeolocation();
    } else {
      geolocationMessage.value = t('geolocation.setManually');
    }
  }

  if (state.currentPosition && userSetPosition.value === false) {
    selectedPosition.value = state.currentPosition;
    setSelectedPoint(state.currentPosition.coords.longitude, state.currentPosition.coords.latitude, state.currentPosition.coords.accuracy);

    if (state.currentPosition.coords.accuracy <= 1) {
      geolocation.deactivateGeolocation();
    }
  }
});

onMounted(() => {
  if (value.value && typeof value.value === 'string' && value.value.length) {
    const pointJSON = GenericValueManager.PointJSONField.decompress(props.genericField, value.value) as GeoJSONFeature;

    const lng = pointJSON.geometry.coordinates[0];
    const lat = pointJSON.geometry.coordinates[1];

    setSelectedPoint(lng, lat, 0);
    userSetPosition.value = true;
  } else {
    const savedPosition = geolocation.getSavedPosition();
    let tooOld = false;

    if (savedPosition) {
      const milliseconds = savedPosition.timestamp;
      const timedelta = new Date().getTime() - milliseconds;
      if (timedelta >= (24 * 60 * 60 * 1000)) {
        tooOld = true;
      }
    }

    if (savedPosition && tooOld === false) {
      setSelectedPoint(savedPosition.coords.longitude, savedPosition.coords.latitude, savedPosition.coords.accuracy);
    } else {
      geolocation.activateGeolocation();
    }
  }
});

const openModal = () => {
  modals.openModal(MODAL_TYPES.DELETE_ACCOUNT);

  setTimeout(function () {
    const initialLatitude = 36.474307;
    const initialLongitude = 18.473501;
    const zoom = 4;

    const worldMap = new WorldMap('map', initialLongitude, initialLatitude, zoom);

    map.value = worldMap;

    worldMap.map.on('click', (event) => {
      userSetPosition.value = true;
      const coordinates = worldMap.map.getCoordinateFromPixel(event.pixel);

      // convert to geojson
      const lngLat: number[] = transform([coordinates[0], coordinates[1]], 'EPSG:3857', 'EPSG:4326');

      setSelectedPoint(lngLat[0], lngLat[1], 0);
      geolocation.deactivateGeolocation();
    });

    if (value.value && typeof value.value === 'string' && value.value.length) {
      const pointJSON = GenericValueManager.PointJSONField.decompress(props.genericField, value.value) as GeoJSONFeature;

      const lng = pointJSON.geometry.coordinates[0];
      const lat = pointJSON.geometry.coordinates[1];

      setSelectedPoint(lng, lat, 0);
      map.value?.setCenter(lng, lat, 10);
    }
  }, 300);
};

const goToGeoname = (result: GeonameResult) => {
  // jump to the geoname
  const lng = parseFloat(result.lng);
  const lat = parseFloat(result.lat);
  map.value?.setCenter(lng, lat, 10);
};
</script>

<template>
  <div>
    <VerbosePlaceholderField
      :label="label"
      :icon="PhMapPin"
      :value="t('observationForm.selectLocation')"
      :error-message="geolocationError"
      :required="genericField.definition.required"
      @click="openModal"
    >
      <template #value>
        <div
          :class="geolocation.status === GeolocationState.waiting ? 'blink' : ''"
        >
          {{ geolocationMessage }}
        </div>
      </template>
    </VerbosePlaceholderField>
    <div class="form-field-map">
      <input
        :name="genericField.uuid"
        v-model="value"
        type="hidden"
      />
      <div class="form-field">
        <div>
          &nbsp;
        </div>
        <div>
          <div class="form-field-help-text">
            <span v-if="genericField.definition.helpText">
              {{ genericField.definition.helpText }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <ModalOverlay
      :modal-type="MODAL_TYPES.DELETE_ACCOUNT"
      @update:modelValue="val => { if (!val) modals.closeModal(); }"
      @close="modals.closeModal"
    >
      <template #title>
        {{ t('observationForm.selectLocation') }}
      </template>
      <div>
        <!-- Tabs -->
        <div class="modal-tabs">
          <TabButton
            :active="activeTab === 'map'"
            @click="activeTab = 'map'"
            :text="t('observationForm.selectLocation')"
          >
          </TabButton>
          <TabButton
            :active="activeTab === 'manual'"
            @click="activeTab = 'manual'"
            :text="t('observationForm.manualInput')"
          >
          </TabButton>
        </div>
        <!-- Tab Content -->
        <div v-show="activeTab === 'map'" class="modal-map-container">
          <div id="map" />
          <GeonameSearch
            class="geoname-search"
            @result-selected="goToGeoname"
          />
          <GPSButton
            class="gps-button-container"
            @activated="removeSelectedPoint"
          />
        </div>
        <div v-show="activeTab === 'manual'" class="manual-coords-container">
          <div class="manual-coords-fields">
            <div>
              <div class="form-field">
                <div class="form-field-icon">
                  <PhGlobeSimple :size="22" />
                </div>
                <div class="form-field-input">
                  <input id="manual-lat" v-model="manualLat" type="number" step="any" min="-90" max="90" placeholder="Latitude" />
                  <label
                    for="manual-lat"
                  >
                    Latitude
                  </label>
                </div>
                <div class="form-field-icon">
                  &nbsp;
                </div>
              </div>
            </div>
            <div>
              <div class="form-field">
                <div class="form-field-icon">
                  <PhGlobeSimple :size="22" />
                </div>
                <div class="form-field-input">
                  <input id="manual-lng" v-model="manualLng" type="number" step="any" min="-180" max="180" placeholder="Longitude" />
                  <label
                    for="manual-lng"
                  >
                    Longitude
                  </label>
                </div>
                <div class="form-field-icon">
                  &nbsp;
                </div>
              </div>
            </div>
            <div class="flex">
              <ColorButton
                :text="t('observationForm.setPosition')"
                type="success"
                @click="setManualCoordinates"
                class="inline-block"
              >  
              </ColorButton>
            </div>
            <div v-if="manualError" class="alert alert-error">
              {{ manualError }}
            </div>
          </div>
        </div>
        <div v-if="selectedPosition">
        </div>
        <div v-else>
          <div
            v-if="geolocation.error"
            class="alert alert-error mt-xl"
          >
            {{ geolocationMessage }}
          </div>
        </div>
        <div v-if="selectedPosition" class="mt-xl">
          <hr>
          <SavePositionButton
            :position="selectedPosition"
          />
        </div>
      </div>
      <template #actions>
        <ColorButton
          class="modal-btn"
          @click="modals.closeModal"
          :text="t('close')"
        >
        </ColorButton>
      </template>
    </ModalOverlay>
  </div>
</template>

<style scoped>
.form-field-map {
  margin-top: -25px;
}

.modal-map-container {
  width: 100%;
  position: relative;
}

.geoname-search {
  position: absolute;
  padding-left: 10px;
  top: 10px;
}

.gps-button-container {
  position: absolute;
  right: 10px;
  bottom: 100px;
}

#map {
  width: 100%;
  height: 50vh;
}

.map-label {
  font-weight: 500;
}

.gps-indicator {
  font-size: var(--font-size-small);
  font-weight: 500;
  color: var(--color-error);
}

.modal-tabs {
  display: flex;
  gap: 1em;
  margin-bottom: 1em;
}
.modal-tabs button {
  padding: 0.5em 1em;
  background: none;
  border: 1px solid var(--color-border, #ccc);
  border-bottom: none;
  cursor: pointer;
  font-weight: 500;
  border-radius: 6px 6px 0 0;
}
.modal-tabs button.active {
  background: var(--color-background, #fff);
  border-bottom: 2px solid var(--color-primary, #007bff);
}
.manual-coords-container {
  padding: var(--size-md);
}

.manual-coords-fields {
  display: flex;
  flex-direction: column;
  gap: var(--gap-medium);
}
</style>
