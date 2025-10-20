import { defineStore } from 'pinia';
import { ref, inject } from 'vue';
import type { Features, GenericForm as GenericFormType, Taxon, LocalCosmosApi } from 'localcosmos-client';
import { LCApiResultTypes } from 'localcosmos-client';
import { fetchOfflineContent } from '@/composables/fetchOfflineContent';
import type { Dataset as IdbDataset } from '@/database/db';
import { load } from 'exifreader';

export type FieldState = {
  hidden: boolean,
  required: boolean,
}

export type GenericFieldStates = Record<string, FieldState>

export const useGenericFormsStore = defineStore('generic-forms', () => {

  const features = inject('features') as Features;
  const LCApi = inject('LCApi') as LocalCosmosApi;

  /** properties */
  const genericForm = ref<GenericFormType|undefined>(undefined);
  const currentlySelectedTaxon = ref<Taxon|null>(null);
  const taxonomicRestrictionStates = ref<GenericFieldStates>({});

  const loadDefaultGenericForm = async() => {
    if (features.GenericForm){
      const defaultGenericFormUuid = features.GenericForm.default.uuid;
      await loadGenericForm(defaultGenericFormUuid);
    } else {
      throw new Error('GenericForm feature is not enabled');
    }
  }

  const loadGenericForm = async (uuid: string) => { 

    if (!features.GenericForm || !features.GenericForm.lookup[uuid]) {
      throw new Error('GenericForm feature is not enabled or UUID not found in lookup');
    }
    
    const path = features.GenericForm.lookup[uuid];

    const { data, error } = await fetchOfflineContent(path);
    if (data !== null) {
      genericForm.value = data as GenericFormType;
      updateFieldStates();

    } else {
      throw new Error(`Failed to load GenericForm with UUID: ${uuid}. Error: ${error}`);
    }
  }

  const loadRemoteGenericForm = async (uuid: string, version: number) => {
    const versionStr = `${version}`;

    const formResponse = await LCApi.getObservationForm(uuid, versionStr);
    if (formResponse.type === LCApiResultTypes.success) {
      genericForm.value = formResponse.data.definition as GenericFormType;
      updateFieldStates();
    } else {
      throw new Error(`Failed to load remote GenericForm with UUID: ${uuid} and version: ${version}. Error: ${formResponse.error}`);
    }
  }

  const loadIdbGenericForm = (dataset: IdbDataset) => {
    const datasetGenericForm = dataset.observationForm;
    if (datasetGenericForm) {
      genericForm.value = datasetGenericForm as GenericFormType;
    } else {
      throw new Error('Dataset does not contain a valid GenericForm');
    }
  }

  const updateFieldStates = () => {
    const processedTaxonomicRestrictionStates: GenericFieldStates = {};
    genericForm.value?.fields.forEach((field) => {

      if (field.role === 'regular' && field.taxonomicRestrictions && field.taxonomicRestrictions.length) {

        let foundMatchingRestriction = false;
        let matchingNuid = '';

        // check taxonomic restrictions
        field.taxonomicRestrictions.every((restriction) => {

          if (currentlySelectedTaxon.value && restriction.taxonSource === currentlySelectedTaxon.value.taxonSource) {
            let hidden = false;
            let required = false;
            // taxa share source
            if (currentlySelectedTaxon.value.taxonNuid.indexOf(restriction.taxonNuid) === 0 && restriction.taxonNuid.length > matchingNuid.length) {
              // current taxon is subtaxon of restriction
              foundMatchingRestriction = true;
              matchingNuid = restriction.taxonNuid;
              switch (restriction.restrictionType) {
                case 'exists':
                  hidden = false;
                  required = false;
                  break;
                case 'required':
                  hidden = false;
                  required = true;
                  break;
                case 'optional':
                  hidden = false;
                  required = false;
                  break;
              }

              processedTaxonomicRestrictionStates[field.uuid] = {
                hidden,
                required,
              };
              return false;
            }
          }

          if (foundMatchingRestriction === false) {
            // no restriction matched yet, apply default state
            let initiallyHidden = false;
            let initiallyRequired = field.definition.required;

            switch (restriction.restrictionType) {
              case 'exists':
                initiallyHidden = true;
                initiallyRequired = false;
                break;
              case 'required':
                initiallyHidden = false;
                initiallyRequired = false;
                break;
              case 'optional':
                initiallyHidden = false;
                initiallyRequired = true;
                break;
            }

            processedTaxonomicRestrictionStates[field.uuid] = {
              hidden: initiallyHidden,
              required: initiallyRequired,
            };
          }
          return true;
        });
      }
    });

    taxonomicRestrictionStates.value = processedTaxonomicRestrictionStates;
  }

  return {
    genericForm, currentlySelectedTaxon, taxonomicRestrictionStates,
    loadDefaultGenericForm, loadGenericForm, loadRemoteGenericForm, updateFieldStates, loadIdbGenericForm }
});