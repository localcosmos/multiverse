<template>
  <div class="horizontal-scroll">
    <div class="horizontal-scroll-track">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.horizontal-scroll {
  width: 100%;
  min-width: 0;              /* important inside flex/grid parents */
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;     /* optional */
}

.horizontal-scroll-track {
  display: flex;
  flex-wrap: nowrap;
  width: max-content;        /* grow to content width */
  min-width: 100%;           /* never smaller than container */
  gap: var(--gap-medium, 12px);
}

.horizontal-scroll-track > * {
  flex: 0 0 auto;            /* prevent children from shrinking/wrapping */
}
</style>