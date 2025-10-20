<script setup lang="ts">
/**
 * This form field covers single-line inputs of the following types:
 * - text
 * - number
 * - password
 * - email
 *
 * BasicFormField does NOT translate labels, placeholders or helpTexts
 */
import { ref, type Component } from 'vue';
import type { HTMLAttributes } from 'vue';
import type { WidgetAttrs } from 'localcosmos-client';
import { useField } from 'vee-validate';
import { createFormFieldPlaceholder } from '@/composables/createFormFieldPlaceholder';
import { PhEye } from '@phosphor-icons/vue';

const props = withDefaults(defineProps<{
  type: string,
  name: string,
  label: string,
  placeholder?: string | null,
  helpText?: string,
  required?: boolean,
  inputmode?: HTMLAttributes['inputmode'],
  icon?: Component | null,
  autocomplete?: boolean,
  widgetAttrs?: WidgetAttrs | null,
  readOnly?: boolean
}>(), {
  placeholder: null,
  helpText: '',
  required: false,
  inputmode: 'text',
  icon: null,
  autocomplete: true,
  widgetAttrs: null,
  readOnly: false,
});

const { value, errorMessage } = useField(() => props.name);

const placeholder = createFormFieldPlaceholder(props.label, props.placeholder, props.required);

const inputElement = ref<HTMLInputElement>();

const showPassword = () => {
  if (props.type === 'password' && inputElement.value) {
    inputElement.value.type = 'text';
  }
};

const hidePassword = () => {
  if (props.type === 'password' && inputElement.value) {
    inputElement.value.type = 'password';
  }
};
</script>

<template>
  <div
    class="form-field"
    :class="(errorMessage && errorMessage.length) ? 'has-error' : ''"
  >
    <div class="form-field-icon">
      <component
        v-if="icon"
        :is="icon"
        size="22"
      />
    </div>
    <div class="form-field-input">
      <input
        :id="name"
        ref="inputElement"
        v-bind="widgetAttrs"
        v-model="value"
        :type="type"
        :required="required"
        :placeholder="placeholder"
        :inputmode="inputmode"
        :autocomplete="autocomplete ? 'on': 'off'"
        :disabled="readOnly"
      >
      <label
        :for="name"
      >
        {{ label }}
      </label>
      <div
        v-if="type === 'password'"
        class="password-eye"
        @pointerdown="showPassword"
        @pointerup="hidePassword"
        @pointercancel="hidePassword"
      >
        <div>
          <PhEye
            size="20"
            weight="bold"
          />
        </div>
      </div>
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
        <span v-if="helpText">
          {{ helpText }}
        </span>
        <span
          v-if="required"
          class="required-text"
        >
          *{{ $t('required') }}
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.password-eye {
  position: absolute;
  right: 0;
  top: 0;
  height: 100%;
  aspect-ratio: 1/1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2px;
}

.password-eye > div {
  border-radius: .5em;
  background-color: #FFF;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
