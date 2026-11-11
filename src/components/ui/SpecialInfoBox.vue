<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    title?: string;
    contentLeft?: boolean;
  }>(),
  {
    contentLeft: false,
  },
);
</script>

<template>
  <div class="special-info-box">
    <div class="special-info-box__icon">
      <slot name="icon" />
    </div>
    <div class="special-info-box__title">
      <h3>{{ title }}</h3>
    </div>
    <div class="special-info-box__content" :class="{ 'content-left': props.contentLeft }">
      <slot />
    </div>
  </div>
</template>

<style>
@layer defaults {
  :root {
    --special-infobox-bg: var(--color-accent-3);
    --special-infobox-text-color: #000;
    --special-infobox-title-size: 30px;

    --special-infobox-font-family: var(--font-family-sans);

    --darkmode-special-infobox-bg: var(--color-accent-3);
    --darkmode-special-infobox-text-color: #FFF;
  }
}

.special-info-box {
  border-radius: var(--border-radius);
  padding: var(--size-md);
  background-color: var(--special-infobox-bg);
  color: var(--special-infobox-text-color);
  position: relative;
}

body.dark .special-info-box {
  background-color: var(--darkmode-special-infobox-bg);
  color: var(--darkmode-special-infobox-text-color);
}

.special-info-box__icon {
  position: absolute;
  width: 70px;
  aspect-ratio: 1/1;
  background-color: var(--special-infobox-bg);
  border-radius: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  top: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.special-info-box__title {
  font-weight: bold;
  margin-top: var(--size-xl);
  text-align: center;
}

.special-info-box__title h3 {
  font-size: var(--special-infobox-title-size);
  color: var(--special-infobox-text-color);
  font-family: var(--special-infobox-font-family);
}

body.dark .special-info-box__title h3 {
  color: var(--darkmode-special-infobox-text-color);
}

.special-info-box__content {
  line-height: 1.5;
  text-align: center;
  padding: var(--size-xl) 0px;
  font-family: var(--special-infobox-font-family);
  font-size: 20px;
}
.special-info-box__content.content-left {
  text-align: left;
}
.special-info-box__content br {
  display: block;
  margin-bottom: 0.75em;
}

@media (min-width: 640px) {
}

@media (min-width: 768px) {
}

@media (min-width: 1024px) {
}

@media (min-width: 1280px) {
  .special-info-box__content {
    font-size: 22px;
  }
}

@media (min-width: 1536px) {
}
</style>
