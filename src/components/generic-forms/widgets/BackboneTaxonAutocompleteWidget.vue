<script setup lang="ts">
import { ref, inject, onMounted } from 'vue';
import type { GenericFormField, BackboneTaxonomy, SearchTaxonList, SearchTaxon } from 'localcosmos-client';
import { GenericValueManager } from 'localcosmos-client';
import { PhBinoculars } from '@phosphor-icons/vue';
import { useField } from 'vee-validate';
import { createGenericFieldLabel } from '@/composables/createGenericFieldLabel';
import { useGenericFormsStore } from '@/stores/generic-forms';
import TaxonSearchResultsBox from '@/components/forms/TaxonSearchResultsBox.vue';

const props = defineProps<{
  genericField: GenericFormField
}>();

const emit = defineEmits(['focus', 'blur']);

const genericFormStore = useGenericFormsStore();

const label = createGenericFieldLabel(props.genericField);
const { value, setValue, errorMessage } = useField(() => props.genericField.uuid);

const backboneTaxonomy = inject('backboneTaxonomy') as BackboneTaxonomy;

const searchResults = ref<SearchTaxonList>([]);
const searchResultBox = ref<HTMLElement>();
const verboseInput = ref<HTMLInputElement>();

const searchTaxon = async (event: Event) => {

  if (value.value) {
    setValue(null);
    genericFormStore.currentlySelectedTaxon = null;
    genericFormStore.updateFieldStates();
  }

  const eventTarget = event.target as HTMLInputElement;
  const searchText = eventTarget.value;
  if (searchResultBox.value) {

    if (searchText.length < 3) {
      searchResultBox.value.classList.add('hidden');
      searchResults.value = [];
    } else {
      searchResultBox.value.classList.remove('hidden');
      const results = await backboneTaxonomy.searchTaxon(searchText) as SearchTaxonList;
      searchResults.value = results;
    }
  }
};

const selectTaxon = (taxon: SearchTaxon) => {
  if (verboseInput.value) {
    if (taxon.name) {
      verboseInput.value.value = taxon.name;
    } else {
      verboseInput.value.value = `${taxon.taxonLatname} ${taxon.taxonAuthor}`;
    }
  }
  if (searchResultBox.value) {
    searchResultBox.value.classList.add('hidden');
  }
  searchResults.value = [];
  const taxonValue = {
    taxonSource: taxon.taxonSource,
    taxonLatname: taxon.taxonLatname,
    taxonAuthor: taxon.taxonAuthor,
    nameUuid: taxon.nameUuid,
    taxonNuid: taxon.taxonNuid,
  };

  const jsonValue = GenericValueManager.TaxonField.compress(props.genericField, taxonValue);
  setValue(jsonValue);
  genericFormStore.currentlySelectedTaxon = taxon;
  genericFormStore.updateFieldStates();
};

const parseTaxonValue = () => {
  if (verboseInput.value) {
    if (value.value) {
      const taxon = GenericValueManager.TaxonField.decompress(props.genericField, value.value);
      let vernacular: string|null = null;
      if (taxon) {
        vernacular = backboneTaxonomy.vernacular(taxon.nameUuid);
      }
      if (vernacular) {
        verboseInput.value.value = vernacular;
      } else if (taxon) {
        verboseInput.value.value = `${taxon.taxonLatname} ${taxon.taxonAuthor}`;
      }
    } else {
      verboseInput.value.value = '';
    }
  }
};

onMounted(() => {
  parseTaxonValue();
});
</script>

<template>
  <div
    class="form-field"
    :class="(errorMessage && errorMessage.length) ? 'has-error' : ''"
  >
    <div class="form-field-icon">
      <PhBinoculars />
    </div>
    <div class="form-field-input">
      <input
        :id="`${genericField.uuid}-verbose`"
        ref="verboseInput"
        type="text"
        autocomplete="off"
        :placeholder="label"
        @keyup="searchTaxon"
        @blur="emit('blur')"
        @focus="emit('focus')"
      >
      <label
        :for="`${genericField.uuid}-verbose`"
      >
        {{ label }}
      </label>
      <input
        v-bind="genericField.widgetAttrs"
        v-model="value"
        type="hidden"
        :required="genericField.definition.required"
        autocomplete="off"
      >
    </div>
    <div class="form-field-icon">
      &nbsp;
    </div>
    <div
      class="help-text"
    >
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
  <div
    ref="searchResultBox"
    class="hidden"
  >
    <TaxonSearchResultsBox
      :search-results="searchResults"
      @selected-taxon="selectTaxon"
    />
  </div>
</template>

<style scoped>
.hidden {
  display: none;
}
</style>
