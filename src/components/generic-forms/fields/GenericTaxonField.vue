<script setup lang="ts">
import { computed } from 'vue';
import type { GenericFormField } from 'localcosmos-client';
import SelectTaxonWidget from '../widgets/SelectTaxonWidget.vue';
import BackboneTaxonAutocompleteWidget from '../widgets/BackboneTaxonAutocompleteWidget.vue';
import FixedTaxonWidget from '../widgets/FixedTaxonWidget.vue';

/**
 * The SelectTaxonWidget does not emit events, because every single radio button would emit that event
 * the taxon should be collected from vee-validates 'values', not by listening to an event
 */

const props = defineProps<{
  genericField: GenericFormField
}>();

const widget = computed(() => {
  let widget: any = BackboneTaxonAutocompleteWidget;

  switch (props.genericField.definition.widget) {
    case 'SelectTaxonWidget':
      widget = SelectTaxonWidget;
      break;
    case 'FixedTaxonWidget':
      widget = FixedTaxonWidget;
      break;
  }

  return widget;
});
</script>

<template>
  <component
    :is="widget"
    :generic-field="genericField"
  />
</template>
