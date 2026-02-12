<script setup lang="ts">
import { ref } from 'vue';
import { t } from 'i18next';
import { RangeFilterSpace } from 'localcosmos-client';
import type { RangeFilterDefinition } from 'localcosmos-client';

import ColorButton from '@/components/ui/ColorButton.vue';

const props = withDefaults(defineProps<{
  space: RangeFilterSpace,
  definition: RangeFilterDefinition
  readOnly: boolean,
}>(), {
  readOnly: false,
});

const input = ref<number | null>(null);

const selectRangeValue = () => {
  if (input.value !== null) {
    props.space.selectNumber(input.value);
  }
};

const triggerVisualUpdate = (event: Event) => {
  const eventTarget = event.target as HTMLInputElement;
  if (props.readOnly) {
    return;
  }
  input.value = parseFloat(eventTarget.value);
};

const preventPan = (event: Event) => {
  event.stopPropagation();
};

const clear = () => {
  input.value = null;
  props.space.deselectNumber();
};

</script>

<template>
  <div>
    <div v-if="readOnly">
      readonly
    </div>
    <div v-else>
      <div class="range-filter-space-input">
        <div>
          {{ space.data.encodedSpace[0] }} {{ definition.unit }}
        </div>
        <div class="range-slider-container">
          <label
            class="flex flex-row gap-2"
            @pointerdown="preventPan"
          >
            <input
              :value="input"
              :disabled="readOnly"
              type="range"
              class="range"
              :min="space.data.encodedSpace[0]"
              :max="space.data.encodedSpace[1]"
              :step="definition.step ? definition.step : 1"
              @input.prevent="triggerVisualUpdate"
              @change="selectRangeValue"
            >
          </label>
        </div>
        <div>
          {{ space.data.encodedSpace[1] }} {{ definition.unit }}
        </div>
      </div>
      <div>
        <div
          v-if="input != null"
          class="range-filter-space-current-value"
        >
          <div class="current-value">
            {{ input }}{{ definition.unit }}
          </div>
          <div>
            <ColorButton
              :text="t('natureGuide.rangeSlider.clear')"
              class="cursor-pointer"
              @click="clear"
            />
          </div>
        </div>
        <div v-else class="text-center">
          {{  $t('natureGuide.rangeSlider.off') }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.range {
  width: 100%;
}

.range-filter-space-input {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  gap: var(--size-md);
  width: 100%;
}

.range-filter-space-current-value {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: var(--size-md);
  width: 100%;
}

.range-slider-container {
  flex-grow: 1;
}

.current-value {
  font-size: var(--font-size-2xl);
}
</style>

