<script setup lang="ts">
// A simple container component that adds a colored stripe background to its content
const props = defineProps<{
  color: string, // Background color of the stripe
  onlyOnLargeScreens?: boolean, // If true, the stripe is only visible on large screens
}>();

const predefinedColors: Record<string, string> = {
  light : 'rgba(255, 255, 255, 0.75)',
  lighter: 'rgba(255, 255, 255, 0.9)',
  dark : 'rgb(0,0,0, 0.3)',
};

let usedColor: string = props.color;

if (predefinedColors[props.color]) {
  usedColor = predefinedColors[props.color];
}

</script>

<template>
  <div
    class="color-stripe" :style="{ background: usedColor }"
    :class="{ 
      'only-on-large-screens': onlyOnLargeScreens,
      'dark': props.color === 'dark'
    }"
  >
    <slot />
  </div>
</template>

<style scoped>
.color-stripe {
  width: 100%;
}


.color-stripe.dark {
}

@media (min-width: 640px) {
}

@media (min-width: 768px) {
}

@media (max-width: 1023px) {
  .color-stripe.only-on-large-screens {
    background: none !important;
  }
}

@media (min-width: 1024px) {

}

@media (min-width: 1280px) {
}

@media (min-width: 1536px) {
}
</style>