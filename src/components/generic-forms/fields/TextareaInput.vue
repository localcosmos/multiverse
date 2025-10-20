<script setup lang="ts">
import type { GenericFormField } from 'localcosmos-client';
import { useField } from 'vee-validate';
import { createGenericFieldLabel } from '@/composables/createGenericFieldLabel';
import { PhArticle } from '@phosphor-icons/vue';

const props = defineProps<{
  genericField: GenericFormField,
  readOnly?: boolean
}>();

// Explicitly type the field as string for textarea
const { value, errorMessage } = useField<string>(() => props.genericField.uuid);

const label = createGenericFieldLabel(props.genericField);
</script>

<template>
  <div
    class="form-field"
    :class="(errorMessage && errorMessage.length) ? 'has-error' : ''"
  >
    <div class="form-field-icon">
      <PhArticle
        :size="22"
      />
    </div>
    <div class="form-field-textarea">
      <textarea
        :id="genericField.uuid"
        v-model="value"
        v-bind="genericField.widgetAttrs"
        :required="genericField.definition.required"
        :placeholder="label"
        :disabled="readOnly"
      />
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

<style scoped>
.form-field-textarea {
  position: relative;
  display: flex;
  flex-direction: column;
}

.form-field-textarea textarea {
  min-height: 100px;
  resize: vertical;
  padding: var(--size-md);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius);
  font-family: inherit;
  font-size: inherit;
}

.form-field-textarea textarea:focus {
  outline: none;
  border-color: var(--color-primary);
}

.form-field-textarea label {
  position: absolute;
  top: var(--size-md);
  left: var(--size-md);
  pointer-events: none;
  transition: all 0.2s;
  color: var(--color-text-secondary);
}

.form-field-textarea textarea:focus + label,
.form-field-textarea textarea:not(:placeholder-shown) + label {
  top: -8px;
  left: 8px;
  font-size: 0.8rem;
  background: white;
  padding: 0 4px;
  color: var(--color-primary);
}
</style>
