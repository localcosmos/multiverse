import { ref, inject } from 'vue';
import type { Frontend } from 'localcosmos-client';
import type { GeonameResult } from '@/types/geolocation';

export function useGeonames() {

  const frontend = inject('frontend') as Frontend;

  let geonamesUsername: string | null = null;

  if (frontend.userContent && frontend.userContent.configuration && frontend.userContent.configuration.geonamesUsername) {
    geonamesUsername = frontend.userContent.configuration.geonamesUsername;
  }

  const results = ref<GeonameResult[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function searchGeonames(query: string) {
    loading.value = true;
    error.value = null;
    results.value = [];

    if (geonamesUsername && query.length > 2) {

      try {
        const url = `https://secure.geonames.org/searchJSON?q=${encodeURIComponent(query)}&maxRows=10&username=${geonamesUsername}&orderby=population`;
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch GeoNames data');
        const data = await response.json();
        results.value = data.geonames.map((item: any) => ({
          name: item.name,
          country: item.countryName,
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lng),
          ...item,
        }));
      } catch (e: any) {
        error.value = e.message || 'Unknown error';
      } finally {
        loading.value = false;
      }
    }
    else {
      error.value = 'GeoNames username is not set';
      loading.value = false;
    }
  }

  return {
    results,
    loading,
    error,
    searchGeonames,
  };
}