<script setup lang="ts">
import { ref, computed, watch, inject, onMounted } from 'vue';
import type { GenericFormField, Features, ObjectClasses, ObjectClassEntryWithKey } from 'localcosmos-client';
import { getObjectClassesForTaxon, getUniversalObjectClasses } from 'localcosmos-client';
import { useField } from 'vee-validate';
import { useGenericFormsStore } from '@/stores/generic-forms';
import { createGenericFieldLabel } from '@/composables/createGenericFieldLabel';
import { fetchOfflineContent } from '@/composables/fetchOfflineContent';
import { PhRows } from '@phosphor-icons/vue';

const props = defineProps<{
  genericField: GenericFormField,
}>();

const features = inject('features') as Features;
const genericFormsStore = useGenericFormsStore();
const label = createGenericFieldLabel(props.genericField);
const { value, setValue, errorMessage } = useField<string>(() => props.genericField.uuid);

const objectClasses = ref<ObjectClasses | null>(null);

onMounted(async () => {
  if (features.ObjectClasses) {
    const uuid = features.ObjectClasses.uuid;
    const { data } = await fetchOfflineContent(
      `/localcosmos/features/ObjectClasses/${uuid}/${uuid}.json`
    );
    if (data !== null) {
      objectClasses.value = data as ObjectClasses;
    }
  }
});

const choices = computed<ObjectClassEntryWithKey[]>(() => {
  if (!objectClasses.value) return [];

  const taxon = genericFormsStore.currentlySelectedTaxon;
  if (taxon) {
    return getObjectClassesForTaxon(objectClasses.value, taxon.taxonSource, taxon.taxonNuid);
  }
  return getUniversalObjectClasses(objectClasses.value);
});

// Clear the value if the selected class is no longer in the choices after a taxon change
watch(choices, (newChoices) => {
  if (value.value && !newChoices.some(c => c.scientificName === value.value)) {
    setValue('');
  }
});
</script>

<template>
  <div
    class="form-field"
    :class="(errorMessage && errorMessage.length) ? 'has-error' : ''"
  >
    <div class="form-field-icon">
      <PhRows size="22" />
    </div>
    <div class="form-field-input">
      <select
        v-model="value"
        :id="genericField.uuid"
        :required="genericField.definition.required"
      >
        <option
          v-if="!genericField.definition.required"
          value=""
        >
          -------
        </option>
        <option
          v-for="choice in choices"
          :key="choice.scientificName"
          :value="choice.scientificName"
        >
          {{ choice.name }}
        </option>
      </select>
      <label :for="genericField.uuid">
        {{ label }}
      </label>
    </div>
    <div class="form-field-icon">
      &nbsp;
    </div>
    <div class="help-text">
      <div>
        <span v-if="errorMessage">
          {{ errorMessage }}
        </span>
      </div>
      <div>
        <span v-if="genericField.definition.helpText">
          {{ $t(genericField.definition.helpText) }}
        </span>
        <span
          v-if="genericField.definition.required"
          class="required-text"
        >
          *{{ $t('required') }}
        </span>
      </div>
    </div>
  </div>
</template>
