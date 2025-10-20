import type { Component } from 'vue';
import { MatrixFilterTypes } from 'localcosmos-client';

import DescriptiveTextAndImagesFilter from '@/components/nature-guide/matrix-filters/DescriptiveTextAndImagesFilter.vue';
import TextOnlyFilter from '@/components/nature-guide/matrix-filters/TextOnlyFilter.vue';
import ColorFilter from '@/components/nature-guide/matrix-filters/ColorFilter.vue';
import NumberFilter from '@/components/nature-guide/matrix-filters/NumberFilter.vue';
import RangeFilter from '@/components/nature-guide/matrix-filters/RangeFilter.vue';
import TaxonFilter from '@/components/nature-guide/matrix-filters/TaxonFilter.vue';

import ReadOnlyColorFilterSpace from '@/components/taxon-profiles/traits/ReadOnlyColorFilterSpace.vue';
import ReadOnlyDescriptiveTextAndImagesFilterSpace from '@/components/taxon-profiles/traits/ReadOnlyDescriptiveTextAndImagesFilterSpace.vue';
import ReadOnlyNumberFilterSpace from '@/components/taxon-profiles/traits/ReadOnlyNumberFilterSpace.vue';
import ReadOnlyRangeFilterSpace from '@/components/taxon-profiles/traits/ReadOnlyRangeFilterSpace.vue';
import ReadOnlyTaxonFilterSpace from '@/components/taxon-profiles/traits/ReadOnlyTaxonFilterSpace.vue';
import ReadOnlyTextOnlyFilterSpace from '@/components/taxon-profiles/traits/ReadOnlyTextOnlyFilterSpace.vue';

// Map filter types to their corresponding components
export const filterComponentMap: Record<MatrixFilterTypes, Component> = {
  DescriptiveTextAndImagesFilter: DescriptiveTextAndImagesFilter,
  TextOnlyFilter: TextOnlyFilter,
  ColorFilter: ColorFilter,
  NumberFilter: NumberFilter,
  RangeFilter: RangeFilter,
  TaxonFilter: TaxonFilter,
};

export const readOnlySpaceComponentMap: Record<MatrixFilterTypes, Component> = {
  DescriptiveTextAndImagesFilter: ReadOnlyDescriptiveTextAndImagesFilterSpace,
  TextOnlyFilter: ReadOnlyTextOnlyFilterSpace,
  ColorFilter: ReadOnlyColorFilterSpace,
  NumberFilter: ReadOnlyNumberFilterSpace,
  RangeFilter: ReadOnlyRangeFilterSpace,
  TaxonFilter: ReadOnlyTaxonFilterSpace,
};

// Resolve the component dynamically based on the filter type
export const resolveComponent = (type: MatrixFilterTypes): Component | null => {
  return filterComponentMap[type] || null;
};

export const resolveReadOnlySpaceComponent =(type: MatrixFilterTypes): Component | null => {
  return readOnlySpaceComponentMap[type] || null;
};