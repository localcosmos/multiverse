import { defineStore } from 'pinia';
import { ref, inject } from 'vue';
import type { Features, Map, Taxon, MapObservationFormFilter } from 'localcosmos-client';
import type { Filter, FilterOrNestedFilter, FilterOrNestedFilterList, Modulations, NestedFilter } from 'anycluster-client';
import { Operators, LogicalOperators } from 'anycluster-client';
import type { AnyclusterOpenLayers } from 'anycluster-openlayers';

interface LastMapView {
  x: number,
  y: number,
  zoom: number,
}

export const useMapStore = defineStore('map', () => {

  const lastMapView = ref<LastMapView | null>(null);
  const useLastMapView = ref<boolean>(false);
  const resetFiltersOnMapLoad = ref<boolean>(false);
  const anycluster = ref<AnyclusterOpenLayers | null>(null);
  const mapError = ref<boolean>(false);

  const features = inject('features') as Features;
  const map = ref<Map | null>(null);
  const availableTaxonomicModulations = ref<Modulations>({});
  const availableObservationFormModulations = ref<Modulations>({});

  const activeObservationFormFilter = ref<FilterOrNestedFilter | FilterOrNestedFilterList | null>(null);
  const activeTaxonomicFilter = ref<FilterOrNestedFilter | FilterOrNestedFilterList | null>(null);


  const attachAnycluster =async (anyclusterOpenlayers: AnyclusterOpenLayers) => {
    anycluster.value = anyclusterOpenlayers;

    if (resetFiltersOnMapLoad.value === true) {
      resetFilters();
      resetFiltersOnMapLoad.value = false;
    } else {

      if (activeTaxonomicFilter.value) {
        anycluster.value.filter(activeTaxonomicFilter.value);
      } else if (activeObservationFormFilter.value) {
        anycluster.value.filter(activeObservationFormFilter.value);
      }
    }

    try {
      await anycluster.value.startClustering();
    } catch (e) {
      console.error('Error starting clustering:', e);
      mapError.value = true;
    }
  }

  const resetFilters = () => {
    if (anycluster.value) {
      anycluster.value.resetFilters(false);
      anycluster.value.postFilterChange(true);
      activeObservationFormFilter.value = null;
      activeTaxonomicFilter.value = null;
    }
  }

  const getLastMapView = () => {
    return lastMapView.value;
  }

  const setLastMapView = (x: number, y: number, zoom: number) => {
    lastMapView.value = {
      x,
      y,
      zoom,
    };
  }

  const setUseLastMapView = (use: boolean) => {
    useLastMapView.value = use;
  }

  const setTaxonomicFilter = (filter: Filter | null) => {
    activeTaxonomicFilter.value = filter;
  }

  const loadMapFeature = async () => {
    if (map.value === null) {
      
      if (features.Map) {
        const mapResponse = await fetch(features.Map.path);
        const mapData = await mapResponse.json() as Map;
        map.value = mapData;

        loadTaxonomicModulations();
        loadObservationFormModulations();
      }
    }
  }

  function loadTaxonomicModulations () {
    if (map.value !== null) {
      map.value.taxonomicFilters.forEach((taxonomicFilter) => {
        const multipleTaxaFilter: NestedFilter[] = [];

        // construct the taxonomic filters
        for (let t = 0; t < taxonomicFilter.taxa.length; t++) {

          const taxon = taxonomicFilter.taxa[t];

          const taxonFilterList = createTaxonFilter(taxon);

          const taxonFilter: NestedFilter = {
            filters: taxonFilterList,
          };

          if (t > 0) {
            taxonFilter.logicalOperator = LogicalOperators.OR;
          }
          
          multipleTaxaFilter.push(taxonFilter);
        }

        availableTaxonomicModulations.value[taxonomicFilter.name] = multipleTaxaFilter;
      });
    }
  }

  const loadObservationFormModulations = () => {
    if (map.value !== null) {
      map.value.observationFormFilters.forEach((observationFormFilter) => {
        const filter: Filter = {
          column: 'observation_form__uuid',
          value: observationFormFilter.observationFormUuid,
          operator: Operators.equals,
        };

        availableObservationFormModulations.value[observationFormFilter.name] = {
          filters: [filter],
        };
      });
    }
  }

  const createTaxonFilter = (taxon: Taxon): Filter[] => {
    const taxonFilterList: Filter[] = [];

    const sourceFilter: Filter = {
      column: 'taxon_source',
      value: taxon.taxonSource,
      operator: Operators.equals,
    };
    taxonFilterList.push(sourceFilter);

    const nuidFilter: Filter = {
      column: 'taxon_nuid',
      value: taxon.taxonNuid,
      operator: Operators.startswith,
    };
    taxonFilterList.push(nuidFilter);

    return taxonFilterList;
  }


  async function applyTaxonomicFilter (name: string) {
    activeObservationFormFilter.value = null;

    const filter = availableTaxonomicModulations.value[name];
    if (filter && anycluster.value) {
      anycluster.value.filter(filter, false); // .filter can consume a single filter or an array of filters
      anycluster.value.postFilterChange(true);
      activeTaxonomicFilter.value = filter;
    }
  }


  const applyObservationFormFilter = (name: string) => {
    if (anycluster.value) {
      activeTaxonomicFilter.value = null;

      const filter = availableObservationFormModulations.value[name];
      anycluster.value.filter(filter, false);
      
      anycluster.value.postFilterChange(true);
      activeObservationFormFilter.value = filter;
    }
  }

  function removeObservationFormFilter () {
    if (anycluster.value) {
      anycluster.value.resetFilters(false);
      anycluster.value.postFilterChange(true);
    }

    activeObservationFormFilter.value = null;
  }

  return {
    attachAnycluster,
    loadMapFeature,
    setTaxonomicFilter,
    map,
    availableTaxonomicModulations,
    availableObservationFormModulations,
    activeTaxonomicFilter,
    getLastMapView,
    setLastMapView,
    setUseLastMapView,
    lastMapView,
    useLastMapView,
    resetFilters,
    resetFiltersOnMapLoad,
    createTaxonFilter,
    applyObservationFormFilter,
    removeObservationFormFilter,
    activeObservationFormFilter,
    loadObservationFormModulations,
    applyTaxonomicFilter,
    mapError,
  };
});