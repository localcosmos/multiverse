<script setup lang="ts">
import { ref } from 'vue';
import type { GenericFormField } from 'localcosmos-client';
import { useField } from 'vee-validate';
import { createGenericFieldLabel } from '@/composables/createGenericFieldLabel';
import { PhQuestionMark } from '@phosphor-icons/vue';

const props = defineProps<{
  genericField: GenericFormField,
}>();

const inputElement = ref<HTMLInputElement>();

const { value, errorMessage } = useField(() => props.genericField.uuid);

const label = createGenericFieldLabel(props.genericField);

</script>

<template>
  <div
    class="form-field"
    :class="(errorMessage && errorMessage.length) ? 'has-error' : ''"
  >
    <div class="form-field-icon">
      <PhQuestionMark
        size="22"
      />
    </div>
    <div class="form-field-checkbox cursor-pointer">
      <input
        :id="`checkbox-${ genericField.uuid }`"
        ref="inputElement"
        v-bind="genericField.widgetAttrs"
        v-model="value"
        type="checkbox"
        :required="genericField.definition.required"
      >
      <label
        :for="`checkbox-${ genericField.uuid }`"
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
          {{ genericField.definition.helpText }}
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
