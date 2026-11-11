<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean;
  disabled?: boolean;
  label?: string;
  labelLeft?: boolean;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
}>();

const toggle = () => {
  emit("update:modelValue", !props.modelValue);
};
</script>

<template>
  <div class="toggle-container">
    <span v-if="labelLeft" class="toggle-label-group">
      <slot />
      <span v-if="label" class="toggle-label" @click="toggle">{{ label }}</span>
    </span>
    <button
      type="button"
      class="toggle-button"
      :class="{ 'is-on': modelValue }"
      :disabled="disabled"
      @click="toggle"
      role="switch"
      :aria-checked="modelValue"
      :aria-label="label"
    >
      <span class="toggle-slider"></span>
    </button>
    <span v-if="!labelLeft" class="toggle-label-group">
      <slot />
      <span v-if="label" class="toggle-label" @click="toggle">{{ label }}</span>
    </span>
  </div>
</template>

<style>
.toggle-container {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
}

.toggle-label-group {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}

.toggle-button {
  position: relative;
  width: 50px;
  height: 26px;
  background-color: #6c757d;
  border: none;
  border-radius: 26px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  padding: 0;
  outline: none;
  flex-shrink: 0;
}

.toggle-button:focus-visible {
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.25);
}

.toggle-button.is-on {
  background-color: #007bff;
}

.toggle-slider {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 20px;
  height: 20px;
  background-color: white;
  border-radius: 50%;
  transition: transform 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.toggle-button.is-on .toggle-slider {
  transform: translateX(24px);
}

.toggle-label {
  cursor: pointer;
  user-select: none;
  color: inherit;
}
</style>
