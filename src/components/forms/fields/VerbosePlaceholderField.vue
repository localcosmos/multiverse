<script setup lang="ts">
import type { Component } from 'vue';

defineProps<{
  label: string,
  value: string,
  required?: boolean,
  placeholder?: string | null,
  helpText?: string,
  errorMessage?:string,
  icon?: Component | null
}>()
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
      <div class="verbose-field">
        <slot name="value">
          {{ value }}
        </slot>
      </div>
      <div class="verbose-label">
        {{ $t(label) }}
      </div>
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
        <span v-if="helpText">
          {{ $t(helpText) }}
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
