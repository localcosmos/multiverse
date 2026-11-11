import type { TaxonWithImage, Features, FeaturedTaxonProfilesList, FeaturedTaxonProfileEntry } from "localcosmos-client";
import { fetchOfflineContent } from '@/composables/fetchOfflineContent';

import { inject } from 'vue';

const getDayOfYear = (date: Date): number => {
  const startOfYear = new Date(date.getFullYear(), 0, 0);
  const diff = Number(date) - Number(startOfYear);
  return Math.floor(diff / (1000 * 60 * 60 * 24));
};

// Map an ISO date string's month/day to the equivalent day-of-year in `year`
const isoToCurrentYearDay = (isoDate: string, year: number): number => {
  const d = new Date(isoDate);
  return getDayOfYear(new Date(year, d.getUTCMonth(), d.getUTCDate()));
};

const isInDayspan = (entry: FeaturedTaxonProfileEntry, dayOfYear: number, year: number): boolean => {
  const { featuredFrom, featuredUntil } = entry;
  if (featuredFrom === null && featuredUntil === null) return false;

  const fromDay = featuredFrom !== null
    ? isoToCurrentYearDay(featuredFrom, year)
    : 1; // null start defaults to Jan 1

  const untilDay = featuredUntil !== null
    ? isoToCurrentYearDay(featuredUntil, year)
    : getDayOfYear(new Date(year, 11, 31)); // null end defaults to Dec 31

  if (fromDay <= untilDay) {
    return dayOfYear >= fromDay && dayOfYear <= untilDay;
  }
  // Span wraps around the year boundary (e.g. Nov → Feb)
  return dayOfYear >= fromDay || dayOfYear <= untilDay;
};

export async function getTodaysHero(): Promise<TaxonWithImage | null> {
  const features = inject('features') as Features;

  const featuredProfilesPath = features.TaxonProfiles.featuredProfiles;
  const { data } = await fetchOfflineContent(featuredProfilesPath);

  if (data === null) return null;

  const featuredProfiles = data as FeaturedTaxonProfilesList;
  if (featuredProfiles.length === 0) return null;

  const now = new Date();
  const dayOfYear = getDayOfYear(now);
  const year = now.getFullYear();

  // Priority: 1) in-season entries, 2) entries without any dayspan, 3) entries outside their dayspan
  const inSeason = featuredProfiles.filter(e => isInDayspan(e, dayOfYear, year));
  const noDayspan = featuredProfiles.filter(e => e.featuredFrom === null && e.featuredUntil === null);
  const outsideDayspan = featuredProfiles.filter(e => !isInDayspan(e, dayOfYear, year) && (e.featuredFrom !== null || e.featuredUntil !== null));
  const pool = inSeason.length > 0 ? inSeason
    : noDayspan.length > 0 ? noDayspan
    : outsideDayspan;

  if (pool.length === 0) return null;

  // Deterministic index: same day-of-year produces the same hero on all devices
  const index = (dayOfYear - 1) % pool.length;
  return pool[index].taxon;
}
