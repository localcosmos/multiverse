<script setup lang="ts">
const props = defineProps<{
  name: string,
  label: string,
  validation: any,
  widgetAttrs: any
}>();
</script>

<template>
  <div class="centered-flex-rows w-full">
    <div class="form-field-input mobile-number-input">
      <input
        v-bind="{ ...widgetAttrs, ...validation.field }"
        type="number"
        :name="name"
        class="form-field"
        inputmode="decimal"
        :placeholder="widgetAttrs.placeholder || label"
      >
      <label
        :for="name"
      >
        {{ label }}
      </label>
    </div>
  </div>
</template>

<style scoped>
.mobile-number-input {
  flex-grow: 1;
}
.plusminus {
  flex-shrink: 1;
}
</style>
