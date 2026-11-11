<script setup lang="ts">
const props = withDefaults(defineProps<{
  submitting: boolean
  text: string
  size?: 'small' | 'medium' | 'big'
  type?: 'default' | 'success' | 'danger' | 'primary' | 'secondary' | 'overlay'
}>(), {
  submitting: false,
  text: 'submit',
  size: 'medium',
  type: 'primary',
});

const sizeClass = props.size === 'small' ? 'small' : props.size === 'big' ? 'big' : 'medium';

const typeClass =
  props.type === 'success' ? 'btn-success' :
  props.type === 'danger'  ? 'btn-danger'  :
  props.type === 'primary' ? 'btn-primary' :
  props.type === 'secondary' ? 'btn-secondary' :
  props.type === 'overlay' ? 'btn-overlay' :
  'btn-default';
</script>

<template>
  <button
    type="submit"
    :disabled="submitting"
    :class="['cbtn', sizeClass, typeClass, 'async-btn']"
  >
    <span v-if="submitting" class="async-btn__loader" />
    <span :class="submitting ? 'async-btn__loader-width-text' : ''">
      {{ $t(text) }}
    </span>
  </button>
</template>

<style>
.async-btn {
  position: relative; /* needed for absolutely-positioned loader dots */
  border: none;       /* reset <button> default */
}

.async-btn__loader-width-text {
  opacity: 0;
}

.async-btn__loader {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: currentColor;
  box-shadow: 16px 0 currentColor, -16px 0 currentColor;
  position: absolute;
  left: calc(50% - 4px);
  top: calc(50% - 4px);
  animation: flash 0.8s ease-out infinite alternate;
}

@keyframes flash {
  0% {
    background-color: transparent;
    box-shadow: 16px 0 transparent, -16px 0 currentColor;
  }
  50% {
    background-color: currentColor;
    box-shadow: 16px 0 transparent, -16px 0 transparent;
  }
  100% {
    background-color: transparent;
    box-shadow: 16px 0 currentColor, -16px 0 transparent;
  }
}
</style>
