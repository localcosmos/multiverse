<script setup lang="ts">
import { ref, inject, onMounted } from 'vue';
import type { Features, Map, FrontendSettings, ReadOnlyDataset } from 'localcosmos-client';
import OnlinePage from '@/components/container/OnlinePage.vue';
import WorldMap from '@/map/WorldMap';
import { AnyclusterOpenLayers } from 'anycluster-openlayers';
import type { AnyclusterClientSettings, KmeansCluster } from 'anycluster-client';
import { SRIDS, IconType } from 'anycluster-client';
import { getTaxonomicImageFileName } from '@/composables/getTaxonomicImageFileName';
import { transform } from 'ol/proj';
import MapPopup from './MapPopup.vue';
import Overlay from 'ol/Overlay.js';
import MapFilters from './MapFilters.vue';
import { useMapStore } from '@/stores/map';

type LocalCosmosCluster = KmeansCluster & {
  taxonSource: string
}

const settings = inject('settings') as FrontendSettings;
const markerFolderPath = '/images/anycluster/';

const map = ref<WorldMap | null>(null);
const anycluster = ref<AnyclusterOpenLayers | null>(null);
const popupObservations = ref<ReadOnlyDataset[]>([]);
const overlayOpen = ref<boolean> (false);

const mapPopupOverlay = ref<Overlay | null>(null);

const mapStore = useMapStore();

const getSinglePinImageURL = (cluster: LocalCosmosCluster) => {
  const taxonNuid = cluster.pinimg as string;
  const taxonSource = cluster.taxonSource as string;

  let imageFileName = getTaxonomicImageFileName(taxonSource, taxonNuid);

  if (!imageFileName) {
    imageFileName = 'pin_unknown';
  }
  return `/images/anycluster/${imageFileName}.png`;
};

const onFinalClick = (event:MouseEvent, markerList: ReadOnlyDataset[]) => {
  if (map.value) {
    popupObservations.value = markerList;
    overlayOpen.value = true;

    const pixels = map.value.map.getPixelFromCoordinate([event.x, event.y]);
    const x = pixels[0];
    const y = pixels[1] - 35;
    const coordinates = map.value.map.getCoordinateFromPixel([x, y]);
    if (mapPopupOverlay.value) {
      mapPopupOverlay.value.setPosition(coordinates);
    }
    
    const mapView = map.value?.map.getView();
    const center = mapView.getCenter();
    const zoom = mapView.getZoom();
    // mapView.animate({center: coordinates})
    if (center && zoom) {
      const center4326 = transform(center, 'EPSG:3857', 'EPSG:4326');
      mapStore.setLastMapView(center4326[0], center4326[1], zoom);
    }
  }
};

const onGotClusters = async () => {
  
};

const anyclusterSettings: AnyclusterClientSettings = {
  srid: SRIDS.EPSG3857,
  markerImageSizes: {
    1: [28, 42],
    5: [30, 30],
    10: [30, 30],
    50: [40, 40],
    100: [40, 40],
    1000: [50, 50],
    10000: [60, 60],
  },
  maxZoom: 16,
  iconType: IconType.exact,
  onFinalClick: onFinalClick,
  onGotClusters: onGotClusters,
  getSinglePinImageURL: getSinglePinImageURL,
  startClustering: false,
};

const closeMapPopup = () => {
  if (mapPopupOverlay.value) {
    mapPopupOverlay.value.setPosition(undefined);
  }
  return false;
};

const initializeMapPopup = () => {

  const popupElement = document.getElementById('mapPopupContainer');
  
  if (popupElement && map.value) {    
    const overlay = new Overlay({
      element: popupElement,
      autoPan: {
        animation: {
          duration: 250,
        },
      },
      positioning: 'bottom-center',
      stopEvent: false,
      className: 'map-popup-overlay'
    });

    mapPopupOverlay.value = overlay;
    map.value.map.addOverlay(overlay);
  }

};


onMounted(async () => {

  await mapStore.loadMapFeature();

  if (mapStore.map) {

    let initialLatitude = mapStore.map.options.initialLatitude || 11;
    let initialLongitude = mapStore.map.options.initialLongitude || 49;
    let zoom = mapStore.map.options.initialZoom || 10;

    if (mapStore.useLastMapView === true && mapStore.lastMapView != null) {
      initialLatitude = mapStore.lastMapView.y;
      initialLongitude = mapStore.lastMapView.x;
      zoom = mapStore.lastMapView.zoom;
    }

    // animations do not work well with maps, setTimeout is not the desired approach
    // but works for now
    setTimeout(() => {
      const worldMap = new WorldMap('ObservationsMap', initialLongitude, initialLatitude, zoom);
      const apiUrl = `${settings.API_URL}${settings.APP_UUID}/anycluster/`;

      map.value = worldMap;

      anycluster.value = new AnyclusterOpenLayers(
        worldMap.map,
        apiUrl,
        markerFolderPath,
        anyclusterSettings,
      );

      mapStore.attachAnycluster(anycluster.value);

      initializeMapPopup();

      worldMap.map.getView().on('change:resolution', (event) => {
        closeMapPopup();
      });

    }, 250);
  }
});
</script>

<template>
  <OnlinePage>
    <div class="map-container">
      <div id="ObservationsMap"></div>
      <MapFilters />
      <div
        id="mapPopupContainer"
        v-show="overlayOpen"
      >
        <MapPopup
          :popup-observations="popupObservations"
          :open="overlayOpen"
          @close="closeMapPopup"
        />
      </div>
      <div v-if="mapStore.mapError" class="map-error">
        <div class="alert alert-error">
          {{ $t('map.clusterLoadError') }}
        </div>
      </div>
    </div>
  </OnlinePage>
</template>

<style scoped>
.map-container {
  width: 100vw;
  height: 100vh;
  background-color: var(--color-white-translucent);
  position: relative;
}

#ObservationsMap {
  width: 100%;
  height: 100%;
}

.map-error {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>