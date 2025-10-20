<script setup lang="ts">
import type { GenericFormField } from 'localcosmos-client';
import type { Component, HTMLAttributes } from 'vue';
import BasicFormField from '@/components/forms/fields/BasicFormField.vue';

import { createGenericFieldLabel } from '@/composables/createGenericFieldLabel';

import { PhTextAa, PhNumberSquareSeven } from '@phosphor-icons/vue';

const props = defineProps<{
  genericField: GenericFormField,
}>();

let type: string = 'text';
let inputmode: HTMLAttributes['inputmode'] = 'text';
let icon: Component = PhTextAa;

const label = createGenericFieldLabel(props.genericField);

switch (props.genericField.fieldClass) {
  case 'CharField':
    type = 'text';
    icon = PhTextAa;
    break;
  case 'DecimalField':
  case 'FloatField':
    type = 'number';
    inputmode = 'decimal';
    icon = PhNumberSquareSeven;
    break;
  case 'IntegerField':
    type = 'number';
    inputmode = 'numeric';
    icon = PhNumberSquareSeven;
    break;
}

</script>

<template>
  <BasicFormField
    :type="type"
    :name="genericField.uuid"
    :label="label"
    :placeholder="label"
    :required="genericField.definition.required"
    :help-text="genericField.definition.helpText"
    :inputmode="inputmode"
    :icon="icon"
    :widget-attrs="genericField.widgetAttrs"
  />
</template>
