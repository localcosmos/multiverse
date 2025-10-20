<script setup lang="ts">
import { onMounted } from 'vue';
import type { GenericFormField } from 'localcosmos-client';
import { GenericValueManager } from 'localcosmos-client';
import { useField } from 'vee-validate';
import { useGenericFormsStore } from '@/stores/generic-forms';

const genericFormStore = useGenericFormsStore();

const props = defineProps<{
  genericField: GenericFormField
}>();

const { value, setValue } = useField(() => props.genericField.uuid);

onMounted(() => {
  const taxon = props.genericField.taxonomicRestrictions[0];

  const taxonValue = {
    taxonSource: taxon.taxonSource,
    taxonLatname: taxon.taxonLatname,
    taxonAuthor: taxon.taxonAuthor,
    nameUuid: taxon.nameUuid,
    taxonNuid: taxon.taxonNuid,
  };
  
  const compressedValue = GenericValueManager.TaxonField.compress(props.genericField, taxonValue);
  setValue(compressedValue);
  genericFormStore.updateFieldStates();
});
</script>

<template>
  <input
    v-model="value"
    type="hidden"
    :required="genericField.definition.required"
  >
</template>
