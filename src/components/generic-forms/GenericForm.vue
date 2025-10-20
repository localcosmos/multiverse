<script setup lang="ts">
import { ref, computed } from 'vue';
import * as Yup from 'yup';
import { t } from 'i18next';
import type { TaxonType, GenericForm as GenericFormType, GenericFormField, ReadOnlyDataset, DatasetReadOnlyImage } from 'localcosmos-client';
import { GenericFormFieldType, GenericFormFieldWidgetType, GenericFormFieldRole, GenericValueManager } from 'localcosmos-client';
import { useGenericFormsStore } from '@/stores/generic-forms';
import type { Dataset as IdbDataset } from '@/database/db';

import GenericBasicField from './fields/GenericBasicField.vue';
import GenericTaxonField from './fields/GenericTaxonField.vue';
import DateTimeJsonField from './fields/DateTimeJsonField.vue';
import PointJSONField from './fields/PointJSONField.vue';
import GenericPictureField from './fields/GenericPictureField.vue';
import TextareaInput from './fields/TextareaInput.vue';
import ChoiceField from './fields/ChoiceField.vue';
import CheckboxField from './fields/CheckboxField.vue';
import MultipleChoiceField from './fields/MultipleChoiceField.vue';

import FormWrapper from '@/components/forms/FormWrapper.vue';
import AsyncButton from '@/components/ui/AsyncButton.vue';

const props = defineProps<{
  genericForm: GenericFormType,
  dataset?: ReadOnlyDataset | IdbDataset | null,
  isIdbDataset?: boolean,
  taxon?: TaxonType,
  editSuccess?: boolean,
  submitting?: boolean,
  saved?: boolean,
}>();

// Set default value for submitting
const submitting = computed(() => props.submitting ?? false);

const emit = defineEmits(['submit', 'resetted']);

const genericFormsStore = useGenericFormsStore();

const taxonomicReferenceField = ref<GenericFormField | null>(null);
const keepFieldUuids = ref<string[]>([]);
const removeFieldUuids = ref<string[]>([]);
const reset = ref<boolean>(false);

interface FormField {
  component: any,
  genericField: GenericFormField,
  serverImages?: DatasetReadOnlyImage[], // Images from server (existing datasets)
}

const componentForField = (genericField: GenericFormField) => {
  switch (genericField.fieldClass) {
    case GenericFormFieldType.TaxonField:
    case GenericFormFieldType.SelectTaxonField:
      return GenericTaxonField;
    case GenericFormFieldType.PointJSONField:
      return PointJSONField;
    case GenericFormFieldType.DateTimeJSONField:
      return DateTimeJsonField;
    case GenericFormFieldType.CharField:
      if (genericField.definition.widget === GenericFormFieldWidgetType.Textarea) {
        return TextareaInput;
      }
      return GenericBasicField;
    case GenericFormFieldType.DecimalField:
    case GenericFormFieldType.FloatField:
    case GenericFormFieldType.IntegerField:
      return GenericBasicField;
    // case 'MultipleChoiceField':
    //  return MultipleChoiceField;
    case 'ChoiceField':
      return ChoiceField;
    case GenericFormFieldType.PictureField:
      return GenericPictureField;
    case GenericFormFieldType.BooleanField:
      return CheckboxField;
    case GenericFormFieldType.MultipleChoiceField:
      return MultipleChoiceField;
    default:
      return GenericBasicField;
    // throw new Error(`Unknown field class: ${genericField.fieldClass}`);
  }
};

// Remove async from computed and simplify
const fields = computed(() => {
  const fieldList: FormField[] = [];

  props.genericForm.fields.forEach((genericField: GenericFormField) => {
    const field: FormField = {
      component: componentForField(genericField),
      genericField: genericField,
    };

    if (genericField.fieldClass === GenericFormFieldType.PictureField) {
      // Only handle server images here
      field.serverImages = [];
      
      if (props.dataset && 'images' in props.dataset && props.dataset.images && genericField.uuid in props.dataset.images) {
        field.serverImages = props.dataset.images[genericField.uuid];
      }
    }

    fieldList.push(field);
  });

  return fieldList;
});

/**
 * field specific validation
 */
function emptyStringToNull (value: any, originalValue: any) {
  if (typeof originalValue === 'string' && originalValue === '') {
    return null;
  }
  return value;
}

const addNumberMinMaxValidation = (
  field: GenericFormField,
  fieldValidation: Yup.NumberSchema
): Yup.NumberSchema => {
  let minMessage = '';
  let maxMessage = '';
  if (typeof field.widgetAttrs.min === 'number') {
    minMessage = t('validation.namedMinNumber', { name: field.definition.label, min: field.widgetAttrs.min });
  }
  if (typeof field.widgetAttrs.max === 'number') {
    maxMessage = t('validation.namedMaxNumber', { name: field.definition.label, max: field.widgetAttrs.max });
  }
  if (typeof field.widgetAttrs.min === 'number') {
    fieldValidation = fieldValidation.min(field.widgetAttrs.min, minMessage);
  }
  if (typeof field.widgetAttrs.max === 'number') {
    fieldValidation = fieldValidation.max(field.widgetAttrs.max, maxMessage);
  }
  return fieldValidation;
};

const validationForField = (field: GenericFormField) => {
  let fieldValidation: Yup.Schema<any>;

  const numberTypeErrorMessage = t('validation.numberTypeError');
  const dateErrorMessage = t('validation.invalidDateError');
  const maxDateErrorMessage = t('validation.maxDateErrorMessage');

  switch (field.fieldClass) {
    case GenericFormFieldType.CharField:
      fieldValidation = Yup.string();
      break;
    case GenericFormFieldType.IntegerField:
    case GenericFormFieldType.DecimalField:
    case GenericFormFieldType.FloatField: {
      let numberValidation = Yup.number()
        .transform((val, orig) => orig == "" ? undefined : val)
        .typeError(numberTypeErrorMessage);
      numberValidation = addNumberMinMaxValidation(field, numberValidation);
      fieldValidation = numberValidation;
      break;
    }
    case GenericFormFieldType.TaxonField:
      fieldValidation = Yup.string();
      break;
    case GenericFormFieldType.DateTimeJSONField:
      fieldValidation = Yup.date().typeError(dateErrorMessage).max(new Date(), maxDateErrorMessage);
      break;
    default:
      fieldValidation = Yup.mixed().nullable();
      break;
  }

  if (field.definition.required === true) {
    fieldValidation = fieldValidation.required(t('validation.requiredField'));
  } else {
    fieldValidation = fieldValidation.nullable().optional();
  }

  return fieldValidation;
};

const validation = computed(() => {
  const formValidation: Record<string, Yup.AnySchema> = {};

  props.genericForm.fields.forEach((field) => {
    formValidation[field.uuid] = validationForField(field);
  });

  return Yup.object(formValidation);
});

/**
 * Initial data
 */
const initialData: Record<string, any> = {};

if (props.dataset) {
  props.genericForm.fields.forEach((field) => {
    if (field.uuid === props.genericForm.taxonomicReference) {
      taxonomicReferenceField.value = field;
    }
    if (field.uuid in props.dataset!.data) { // props.dataset cannot be null as stated in the outer if condition
      let datasetData = props.dataset!.data[field.uuid];
      
      if (field.fieldClass === GenericFormFieldType.MultipleChoiceField && datasetData) {
        datasetData = Array.isArray(datasetData) ? [...datasetData] : datasetData;
      }

      const initialValue = GenericValueManager[field.fieldClass].compress(field, datasetData);
      initialData[field.uuid] = initialValue;
    }
  });
} else {
  props.genericForm.fields.forEach((field) => {
    if (props.taxon && field.role === GenericFormFieldRole.taxonomicReference) {
      taxonomicReferenceField.value = field;
      initialData[field.uuid] = GenericValueManager.TaxonField.compress(field, props.taxon);
      genericFormsStore.currentlySelectedTaxon = props.taxon;
      genericFormsStore.updateFieldStates();
    } else {
      const initialValue = GenericValueManager[field.fieldClass].compressedInitial(field);
      if (initialValue !== null) {
        initialData[field.uuid] = initialValue;
      }
    }
  });
}

const onSubmit = async (compressedData: Record<string, any>, setServerErrors: Function) => {

  // decompress all data
  const decompressedData: Record<string, any> = {};

  props.genericForm.fields.forEach((field) => {
    if (field.uuid in compressedData) {
      const value = compressedData[field.uuid];

      if ((value || value === 0) && value !== null && value !== '') {
        const decompressedValue = GenericValueManager[field.fieldClass].decompress(field, value);
        decompressedData[field.uuid] = decompressedValue;
      }
    }
  });

  emit('submit', decompressedData, props.genericForm, setServerErrors);

};

// this does not cover the requiredness of a field yet
// the requiredness still has to be coded in
const fieldClasses = computed(() => {
  const classes: Record<string, string> = {};

  props.genericForm.fields.forEach((field) => {
    if (field.uuid in genericFormsStore.taxonomicRestrictionStates) {
      const state = genericFormsStore.taxonomicRestrictionStates[field.uuid];
      if (state.hidden === true) {
        classes[field.uuid] = 'hidden';
      }
    } else {
      classes[field.uuid] = '';
    }
  });
  return classes;
});

/*
onUpdated(() => {
  if (props.saved === true) {
    reset.value = true;

    const keepFields:string[] = [];
    const removeFields:string[] = [];

    if (taxonomicReferenceField.value && taxonomicReferenceField.value.definition.widget === GenericFormFieldWidgetType.BackboneTaxonAutocompleteWidget) {
      removeFields.push(taxonomicReferenceField.value.uuid);
    }

    props.genericForm.fields.forEach((field) => {
      if (field.role === GenericFormFieldRole.geographicReference || field.role === GenericFormFieldRole.temporalReference) {
        keepFields.push(field.uuid);
      }

      if (field.definition.widget === GenericFormFieldWidgetType.FixedTaxonWidget) {
        keepFields.push(field.uuid);
      }
    });

    keepFieldUuids.value = keepFields;
    removeFieldUuids.value = removeFields;

    emit('resetted');
  }
}); */
</script>

<template>
  <div>
    <div>
      <FormWrapper
        :validation="validation"
        :initial-data="initialData"
        :edit-success="props.editSuccess"
        :fields-to-keep="keepFieldUuids"
        :fields-to-remove="removeFieldUuids"
        :reset="reset"
        @submit="onSubmit"
        @resetted="reset=false"
      >
        <div
          v-for="field in fields"
          :key="field.genericField.uuid"
          :class="fieldClasses[field.genericField.uuid]"
          class="form-field-container relative"
        >
          <component
            :is="field.component"
            v-if="field.genericField.fieldClass === GenericFormFieldType.PictureField"
            :generic-field="field.genericField"
            :server-images="field.serverImages"
            :dataset-uuid="props.isIdbDataset && props.dataset ? props.dataset.uuid : undefined"
          />
          <component
            :is="field.component"
            v-else
            :generic-field="field.genericField"
          />
        </div>
        <template #actions>
          <div>
            <AsyncButton
              text="observationForm.save"
              :submitting="submitting"
            />
          </div>
        </template>
      </FormWrapper>
    </div>
  </div>
</template>

<style scoped>
.form-field-container {
  transition: var(--transition-cubic);
  opacity: 1;
  max-height: 1000px;
}

.form-field-container.hidden {
  opacity: 0;
  pointer-events: none;
  max-height: 0;
}
</style>
