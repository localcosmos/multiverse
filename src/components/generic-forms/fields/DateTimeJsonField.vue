<script setup lang="ts">
import type { GenericFormField } from 'localcosmos-client';
import { t } from 'i18next';
import BasicFormField from '@/components/forms/fields/BasicFormField.vue';
import { createGenericFieldLabel } from '@/composables/createGenericFieldLabel';
import { PhCalendar } from '@phosphor-icons/vue';

const props = defineProps<{
  genericField: GenericFormField
}>();

const label = createGenericFieldLabel(props.genericField);
const fieldType = props.genericField.definition.mode ? props.genericField.definition.mode : 'datetime-local'; 
</script>

<template>
  <BasicFormField
    :type="fieldType"
    :name="genericField.uuid"
    :label="t(label)"
    :placeholder="t(label)"
    :required="genericField.definition.required"
    :help-text="genericField.definition.helpText"
    :icon="PhCalendar"
    :widget-attrs="genericField.widgetAttrs"
  />
</template>
