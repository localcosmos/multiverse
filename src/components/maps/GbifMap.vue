<script setup lang="ts">
import { onMounted, ref } from "vue";
import NoNetworkConnectionAlert from "@/components/ui/NoNetworkConnectionAlert.vue";
import View from "ol/View";
import Map from "ol/Map";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import XYZ from "ol/source/XYZ";
import Zoom from "ol/control/Zoom";
import { defaults as defaultControls } from "ol/control";

import { useNetworkInformationStore } from "@/stores/network-information";

const networkStore = useNetworkInformationStore();

const props = defineProps<{
  gbifNubkey: number;
}>();

const pixelRatio = Number.parseInt(window.devicePixelRatio.toString()) || 1;

const occurrenceMap = ref<HTMLElement>();

onMounted(() => {
  setTimeout(() => {
    const map = new Map({
      target: occurrenceMap.value,
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
        new TileLayer({
          source: new XYZ({
            url: `https://api.gbif.org/v2/map/occurrence/density/{z}/{x}/{y}@${pixelRatio}x.png?style=blueHeat.point&taxonKey=${props.gbifNubkey}`,
            tilePixelRatio: pixelRatio,
            tileSize: [1024, 1024],
          }),
        }),
      ],

      controls: defaultControls({ zoom: false }).extend([
        new Zoom({ className: "ol-zoom ol-zoom-top-right" }),
      ]),
      view: new View({
        zoom: 3,
        center: [1112491.3687509221, 7085590.525908949],
        constrainResolution: true,
        enableRotation: false,
      }),
    });
  }, 450);
});
</script>

<template>
  <div v-if="networkStore.isOnline" class="occurrence-map-container">
    <div class="w-full h-full">
      <div ref="occurrenceMap" class="occurrence-map"></div>
    </div>
  </div>
  <div v-else>
    <NoNetworkConnectionAlert />
  </div>
</template>

<style>
.occurrence-map-container {
  height: 100%;
  width: 100%;
}

.occurrence-map {
  width: 100%;
  height: 100%;
}

@media (min-width: 1280px) {
  .occurrence-map-container {
    height: 100%;
  }
}
</style>
