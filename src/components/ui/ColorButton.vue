<script setup lang="ts">

const props = defineProps<{
  text: string,
  size?: 'small' | 'medium' | 'big',
  type?: 'default' | 'success' | 'danger' | 'error'
}>();

const sizeClass =
  props.size === 'small'
    ? 'small'
    : props.size === 'big'
    ? 'big'
    : 'medium';

const typeClass =
  props.type === 'success'
    ? 'btn-success'
    : props.type === 'danger' || props.type === 'error'
    ? 'btn-danger'
    : 'btn-default';
</script>

<template>
  <div :class="['pill-link', sizeClass, typeClass, 'bg-translucent-light']">
    <slot name="left" />
    <div v-html="text" class="button-text" />
    <slot name="right" />
  </div>
</template>

<style scoped>
.pill-link {
  font-weight: 500;
  box-shadow: 0px 2px 4px 0px rgba(0,0,0,0.2);
  font-size: 14px;
  padding: 8px 20px;
  border-radius: 5em;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  gap: 4px;
  text-decoration: none;
  cursor: pointer;
}

/* Types */
.btn-default {
  background: var(--color-white-translucent);
  color: #222;
}
.btn-success {
  background: var(--color-success);
  color: #fff;
}
.btn-danger {
  background: var(--color-error);
  color: #fff;
}

/* Sizes */
.pill-link.small {
  font-size: 12px;
  padding: 4px 12px;
}

.pill-link.medium {
  font-size: 14px;
  padding: 8px 20px;
}

.pill-link.big {
  font-size: 18px;
  padding: 14px 32px;
}

.button-text {
  text-decoration: none;
  color: inherit;
}

@media (min-width: 365px) {
  .pill-link.small {
    font-size: 13px;
    padding: 7px 16px;
  }
  .pill-link.medium {
    font-size: 15px;
    padding: 10px 24px;
  }
  .pill-link.big {
    font-size: 20px;
    padding: 18px 40px;
  }
}
</style>
