import type { TaxonWithImage, Features } from "localcosmos-client";
import { fetchOfflineContent } from '@/composables/fetchOfflineContent';

import { inject } from 'vue';

const getCurrentDayOfYear = (): number => {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 0);
  // Convert to number before subtraction
  const diff = Number(now) - Number(startOfYear);
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  return dayOfYear;
}

export async function getTodaysHero (): Promise<TaxonWithImage|null> {
  const features = inject('features') as Features;

  const featuredProfilesPath = features.TaxonProfiles.featuredProfiles;
  const { data, error } = await fetchOfflineContent(featuredProfilesPath);

  let todaysHero = null;

  if (data !== null) {
    const featuredProfiles = data as TaxonWithImage[];

    if (featuredProfiles.length > 0) {

      const dayOfYear = getCurrentDayOfYear();
      const index = (dayOfYear - 1) % featuredProfiles.length;

      todaysHero = featuredProfiles[index];

    }
  }

  return todaysHero;
}