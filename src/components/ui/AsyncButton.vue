<script setup lang="ts">
const props = withDefaults(defineProps<{
  submitting: boolean
  text: string
}>(), {
  submitting: false,
  text: 'submit',
});
</script>

<template>
  <button
    type="submit"
    :disabled="submitting"
    class="btn btn-primary async-btn"
  >
    <span
      v-if="submitting"
      class="loader"
    >
    </span>
    <span :class="submitting ? 'loader-width-text' : ''">
      {{ $t(text) }}
    </span>
  </button>
</template>

<style scoped>
.async-btn {
  position: relative;
  color: white;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  justify-content: center;
}

.async-btn .icon {
  height: 1rem;
  width: 1rem;
}

.loader-width-text {
  color: var(--color-button);
  opacity: 0;
}

.loader {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #fff;
  box-shadow: 16px 0 #fff, -16px 0 #fff;
  position: absolute;
  left: calc(50% - 4px);
  top: calc(50% - 4px);
  animation: flash 0.8s ease-out infinite alternate;
}

@keyframes flash {
  0% {
    background-color: #FFF2;
    box-shadow: 16px 0 #FFF2, -16px 0 #FFF;
  }
  50% {
    background-color: #FFF;
    box-shadow: 16px 0 #FFF2, -16px 0 #FFF2;
  }
  100% {
    background-color: #FFF2;
    box-shadow: 16px 0 #FFF, -16px 0 #FFF2;
  }
}
</style>
