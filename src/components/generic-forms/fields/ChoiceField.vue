<script setup lang="ts">
import type { GenericFormField } from 'localcosmos-client';
import { useField } from 'vee-validate';
import { createGenericFieldLabel } from '@/composables/createGenericFieldLabel';
import { PhRows } from '@phosphor-icons/vue';

const props = defineProps<{
  genericField: GenericFormField
}>();

const label = createGenericFieldLabel(props.genericField);

// Let VeeValidate use the form's initialValues instead of setting our own
const { value, errorMessage } = useField(() => props.genericField.uuid);
</script>

<template>
  <div
    class="form-field"
    :class="(errorMessage && errorMessage.length) ? 'has-error' : ''"
  >
    <div class="form-field-icon">
      <PhRows
        size="22"
      />
    </div>
    <div class="form-field-input">
      <select
        v-model="value"
        :id="genericField.uuid"
        v-bind="genericField.widgetAttrs"
      >
        <option
          v-for="(choice, index) in genericField.definition.choices"
          :key="index"
          :value="choice[0]"
        >
          {{ choice[1] }}
        </option>
      </select>
      <label
        :for="genericField.uuid"
      >
        {{ label }}
      </label>
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
</template>
