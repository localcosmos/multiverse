<script setup lang="ts">
import type { TaxonText } from "localcosmos-client";
import { ref, watch } from "vue";
import GlossarizedText from "@/components/text/GlossarizedText.vue";
import { PhCaretUp, PhCaretDown } from "@phosphor-icons/vue";

const props = defineProps<{
  text: TaxonText;
  darkIcon?: boolean;
  expandedByDefault?: boolean;
}>();

const isLongTextExpanded = ref(props.expandedByDefault ?? false);

watch(
  () => props.expandedByDefault,
  (value) => {
    isLongTextExpanded.value = value ?? false;
  },
);

const toggleLongText = (): void => {
  isLongTextExpanded.value = !isLongTextExpanded.value;
};
</script>

<template>
  <div class="short-long-text">
    <GlossarizedText
      v-if="text.shortText && (!text.longText || !isLongTextExpanded)"
      :html-text="text.shortText"
    />
    <GlossarizedText
      v-if="text.longText && (!text.shortText || isLongTextExpanded)"
      :html-text="text.longText"
    />
    <div
      v-if="text.shortText && text.longText"
      class="short-long-text__toggle"
      :class="{ 'short-long-text__toggle--dark': props.darkIcon }"
      @click.stop="toggleLongText()"
    >
      <PhCaretUp v-if="isLongTextExpanded" :size="18" />
      <PhCaretDown v-else :size="18" />
    </div>
  </div>
</template>

<style>
@layer defaults {
  :root {
    --short-long-text-toggle-bg: rgba(255, 255, 255, 0.1);
    --short-long-text-toggle-color: rgba(169, 207, 208, 1);
    --short-long-text-toggle-hover-bg: rgba(255, 255, 255, 0.28);
    --short-long-text-toggle-hover-border-color: rgba(255, 255, 255, 0.45);
    --short-long-text-toggle-dark-bg: rgba(0, 0, 0, 0.1);
    --short-long-text-toggle-dark-color: #333;
  }
}

.short-long-text {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  text-align: left;
}

.short-long-text > div {
  min-width: 0;
  overflow-wrap: break-word;
}

.short-long-text__toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  vertical-align: middle;
  flex-shrink: 0;
  margin-left: 20px;
  width: 1.5rem;
  min-width: 1.5rem;
  height: 1.5rem;
  border-radius: 999px;
  background: var(--short-long-text-toggle-bg);
  color: var(--short-long-text-toggle-color);
  cursor: pointer;
  user-select: none;
  transition:
    background 0.18s ease,
    border-color 0.18s ease;
}

.short-long-text__toggle svg {
  color: currentColor;
  display: inline-flex;
}

.short-long-text__toggle:hover {
  background: var(--short-long-text-toggle-hover-bg);
  border-color: var(--short-long-text-toggle-hover-border-color);
}

.short-long-text__toggle--dark {
  background: var(--short-long-text-toggle-dark-bg);
  color: var(--short-long-text-toggle-dark-color);
}
</style>
