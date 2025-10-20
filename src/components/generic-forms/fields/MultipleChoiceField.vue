<script setup lang="ts">
import type { GenericFormField } from 'localcosmos-client';
import { useField } from 'vee-validate';
import { createGenericFieldLabel } from '@/composables/createGenericFieldLabel';
import { PhRows } from '@phosphor-icons/vue';

const props = defineProps<{
  genericField: GenericFormField,
}>();

const label = createGenericFieldLabel(props.genericField);

const { value, errorMessage } = useField(() => props.genericField.uuid);

if (!Array.isArray(value.value)) {
  value.value = [];
}
</script>

<template>
  <div
    class="form-field"
    :class="(errorMessage && errorMessage.length) ? 'has-error' : ''"
  >
    <div class="form-field-icon">
      <PhRows size="22" />
    </div>
    <div>
      <div class="form-field-label">
        <div>
          {{ label }}
        </div>
      </div>
      <div>
        <div
          v-for="choice in genericField.definition.choices"
          :key="choice[0]"
          class="mc-choices my-m"
        >
          <label :for="`${genericField.uuid}-${choice[0]}`">
            <input
              type="checkbox"
              :id="`${genericField.uuid}-${choice[0]}`"
              :value="choice[0]"
              v-model="value"
              :name="genericField.uuid"
            />
            {{ choice[1] }}
          </label>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.mc-choices {
  display: flex;
  align-items: center;
}

/* Add spacing between checkbox and label text */
.mc-choices input[type="checkbox"] {
  margin-right: var(--size-md);
}
</style>