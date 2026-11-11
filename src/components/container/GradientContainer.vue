<script setup lang="ts">
type GradientType = 'dark' | 'light';

const props = withDefaults(defineProps<{
  gradientType?: GradientType;
}>(), {
  gradientType: 'light',
});
</script>

<template>
  <div class="gradient-container" :class="`gradient-container--${props.gradientType}`">
    <div class="gradient-container-left"></div>
    <div class="gradient-container-center">
      <slot />
    </div>
    <div class="gradient-container-right"></div>
  </div>
</template>

<style>
@layer defaults {
  :root {
    --gradient-container-dark-bgcolor: rgba(0, 0, 0, 0.7);
    --gradient-container-dark-left: linear-gradient(
        to right,
        rgba(0, 0, 0, 0.95) 0%,
        rgba(0, 0, 0, 0.8) 50%,
        rgba(0, 0, 0, 0) 100%
      );
    --gradient-container-dark-right: linear-gradient(
        to left,
        rgba(0, 0, 0, 0.95) 0%,
        rgba(0, 0, 0, 0.8) 50%,
        rgba(0, 0, 0, 0) 100%
      );
    --darkmode-gradient-container-dark-bgcolor: rgba(1, 43, 61, 0.7);
    --darkmode-gradient-container-dark-left: linear-gradient(
      to right,
      rgba(0, 0, 0, 0.95) 0%,
      rgba(0, 0, 0, 0.8) 50%,
      rgba(0, 0, 0, 0) 100%
    );
    --darkmode-gradient-container-dark-right: linear-gradient(
      to left,
      rgba(0, 0, 0, 0.95) 0%,
      rgba(0, 0, 0, 0.8) 50%,
      rgba(0, 0, 0, 0) 100%
    );

    --gradient-container-light-bgcolor: rgba(255, 255, 255, 0.7);
    --gradient-container-light-left: linear-gradient(
        to right,
        rgba(255, 255, 255, 0.95) 0%,
        rgba(255, 255, 255, 0.8) 50%,
        rgba(255, 255, 255, 0) 100%
      );
    --gradient-container-light-right: linear-gradient(
        to left,
        rgba(255, 255, 255, 0.95) 0%,
        rgba(255, 255, 255, 0.8) 50%,
        rgba(255, 255, 255, 0) 100%
      );
    --darkmode-gradient-container-light-bgcolor: rgba(255, 255, 255, 0.1);
    --darkmode-gradient-container-light-left: linear-gradient(
      to right,
      rgba(255, 255, 255, 0.3) 0%,
      rgba(255, 255, 255, 0.15) 50%,
      rgba(255, 255, 255, 0) 100%
    );
    --darkmode-gradient-container-light-right: linear-gradient(
      to left,
      rgba(255, 255, 255, 0.3) 0%,
      rgba(255, 255, 255, 0.15) 50%,
      rgba(255, 255, 255, 0) 100%
    );
  }
}

.gradient-container {
  display: block;
  width: 100%;
}

.gradient-container--dark {
  background: var(--gradient-container-dark-bgcolor);
}

body.dark .gradient-container--dark {
  background: var(--darkmode-gradient-container-dark-bgcolor);
}

.gradient-container--light {
  background: var(--gradient-container-light-bgcolor);
}

body.dark .gradient-container--light {
  background: var(--darkmode-gradient-container-light-bgcolor);
}


.gradient-container-left,
.gradient-container-right {
  display: none;
}

.gradient-container-center {
  position: relative;
  width: 100%;
}

@media (min-width: 640px) {
}

@media (min-width: 768px) {
}

@media (min-width: 1024px) {
}

@media (min-width: 1280px) {
  .gradient-container {
    display: flex;
    align-items: stretch;
    width: 100%;
  }

  .gradient-container-center {
    width: 1280px;
  }

  .gradient-container-left,
  .gradient-container-right {
    display: block;
    flex: 1 1 auto;
    pointer-events: none;
  }

  .gradient-container--dark .gradient-container-left {
    background: var(--gradient-container-dark-left);
  }

  .gradient-container--dark .gradient-container-right {
    background: var(--gradient-container-dark-right);
  }

  body.dark .gradient-container--dark .gradient-container-left {
    background: var(--darkmode-gradient-container-dark-left);
  }

  body.dark .gradient-container--dark .gradient-container-right {
    background: var(--darkmode-gradient-container-dark-right);
  }

  .gradient-container--light .gradient-container-left {
    background: var(--gradient-container-light-left);
  }

  .gradient-container--light .gradient-container-right {
    background: var(--gradient-container-light-right);
  }

  body.dark .gradient-container--light .gradient-container-left {
    background: var(--darkmode-gradient-container-light-left);
  }

  body.dark .gradient-container--light .gradient-container-right {
    background: var(--darkmode-gradient-container-light-right);
  }
}

@media (min-width: 1536px) {
}
</style>
