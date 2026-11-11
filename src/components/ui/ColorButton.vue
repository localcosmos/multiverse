<script setup lang="ts">
const props = defineProps<{
  text: string;
  size?: "small" | "medium" | "big";
  type?: "default" | "success" | "danger" | "primary" | "secondary" | "overlay";
}>();

const sizeClass = props.size === "small" ? "small" : props.size === "big" ? "big" : "medium";

const typeClass =
  props.type === "success"
    ? "btn-success"
    : props.type === "danger"
      ? "btn-danger"
      : props.type === "primary"
        ? "btn-primary"
        : props.type === "secondary"
          ? "btn-secondary"
          : props.type === "overlay"
            ? "btn-overlay"
            : "btn-default";
</script>

<template>
  <div :class="['cbtn', sizeClass, typeClass]">
    <slot name="left" />
    <div v-html="text" class="button-text" />
    <slot name="right" />
  </div>
</template>

<style>
@layer defaults {
  :root {
    --colorbutton-default-bg: rgb(150, 150, 150);
    --colorbutton-default-color: var(--color-neutral-2);
    --colorbutton-success-bg: var(--color-success);
    --colorbutton-success-color: #FFF;
    --colorbutton-danger-bg: var(--color-error);
    --colorbutton-danger-color: #FFF;
    --colorbutton-primary-bg: var(--color-primary);
    --colorbutton-primary-color: var(--color-primary-contrast);
    --colorbutton-secondary-bg: var(--color-secondary);
    --colorbutton-secondary-color: #FFF;
    --colorbutton-tertiary-bg: var(--color-tertiary);
    --colorbutton-tertiary-color: var(--color-tertiary-contrast);
    --colorbutton-overlay-bg: var(--color-neutral-2-transparent);
    --colorbutton-overlay-color: var(--color-accent-3);

    --darkmode-colorbutton-default-bg: var(--darkmode-color-grey);
    --darkmode-colorbutton-default-color: var(--darkmode-color-dark-1);
    --darkmode-colorbutton-success-bg: var(--darkmode-color-success);
    --darkmode-colorbutton-success-color: var(--darkmode-color-success-contrast);
    --darkmode-colorbutton-danger-bg: var(--darkmode-color-error);
    --darkmode-colorbutton-danger-color: #FFF;
    --darkmode-colorbutton-primary-bg: var(--darkmode-color-primary);
    --darkmode-colorbutton-primary-color: var(--darkmode-color-primary-contrast);
    --darkmode-colorbutton-secondary-bg: var(--darkmode-color-secondary);
    --darkmode-colorbutton-secondary-color: var(--darkmode-color-secondary-contrast);
    --darkmode-colorbutton-overlay-bg: var(--darkmode-color-dark-1-transparent);
    --darkmode-colorbutton-overlay-color: var(--darkmode-color-light-1);
  }
}

.cbtn {
  font-weight: 700;
  font-size: 14px;
  letter-spacing: 1px;
  padding: 8px 20px;
  border-radius: 5em;
  display: inline-flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  gap: 4px;
  text-decoration: none;
  cursor: pointer;
  transition:
    transform 0.15s ease,
    filter 0.15s ease;
  background-color: var(--colorbutton-default-bg);
  color: var(--colorbutton-default-color);
}

.cbtn.btn-primary {
  background-color: var(--colorbutton-primary-bg);
  color: var(--colorbutton-primary-color);
}

.cbtn.btn-overlay {
  background-color: var(--colorbutton-overlay-bg);
  color: var(--colorbutton-overlay-color);
}

.cbtn.btn-success {
  background-color: var(--colorbutton-success-bg);
  color: var(--colorbutton-success-color);
}

.cbtn.btn-danger {
  background-color: var(--colorbutton-danger-bg);
  color: var(--colorbutton-danger-color);
}

body.dark .cbtn {
  background-color: var(--darkmode-colorbutton-default-bg);
  color: var(--darkmode-colorbutton-default-color);
}
body.dark .cbtn.btn-success {
  background-color: var(--darkmode-colorbutton-success-bg);
  color: var(--darkmode-colorbutton-success-color);
}
body.dark .cbtn.btn-danger {
  background-color: var(--darkmode-colorbutton-danger-bg);
  color: var(--darkmode-colorbutton-danger-color);
}
body.dark .cbtn.btn-primary {
  background-color: var(--darkmode-colorbutton-primary-bg);
  color: var(--darkmode-colorbutton-primary-color);
}
body.dark .cbtn.btn-secondary {
  background-color: var(--darkmode-colorbutton-secondary-bg);
  color: var(--darkmode-colorbutton-secondary-color);
}
body.dark .cbtn.btn-overlay {
  background-color: var(--darkmode-colorbutton-overlay-bg);
  color: var(--darkmode-colorbutton-overlay-color);
}

.cbtn:hover {
  filter: brightness(1.12);
}

.cbtn.btn-success:hover,
.cbtn.btn-danger:hover {
  filter: brightness(1.12);
}



/* Sizes */
.cbtn.small {
  font-size: 8px;
  padding: 4px 12px;
}

.cbtn.medium {
  font-size: 10px;
  padding: 8px 20px;
}

.cbtn.big {
  font-size: 18px;
  padding: 14px 32px;
}

.cbtn .button-text {
  text-decoration: none;
  color: inherit;
  font-family: var(--font-family-colorbutton);
  font-weight: 700;
  text-align: center;
}

@media (min-width: 365px) {
  .cbtn.small {
    font-size: 13px;
    padding: 7px 16px;
  }
  .cbtn.medium {
    font-size: 12px;
    padding: 10px 24px;
  }
  .cbtn.big {
    font-size: 20px;
    padding: 18px 40px;
  }
}

@media (min-width: 1024px) {
  .cbtn.medium {
    font-size: 14px;
  }
}
</style>
