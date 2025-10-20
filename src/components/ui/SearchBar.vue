<script setup lang="ts">
import { t } from 'i18next';
import { PhMagnifyingGlass } from '@phosphor-icons/vue';
import { ref, defineEmits } from 'vue';

// Define the emitted event
const emit = defineEmits(['update:modelValue']);

// Create a reactive variable for the input value
const searchText = ref('');
</script>

<template>
  <div class="search-bar">
    <div class="input-wrapper">
      <PhMagnifyingGlass class="icon" :size="20" />
      <input
        type="text"
        v-model="searchText"
        :placeholder="t('Search')"
        @input="$emit('update:modelValue', searchText)"
      />
    </div>
  </div>
</template>

<style scoped>
.search-bar {
  width: 100%;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
}

.input-wrapper .icon {
  position: absolute;
  left: 15px;
  color: #888;
}

.input-wrapper input[type="text"] {
  border: none;
  width: 100%;
  height: 48px;
  padding: 0px 15px 0px 40px; /* Add padding to the left for the icon */
  font-size: 0.9rem;
  border-radius: 5em;
  background: #FFF;
  outline: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.input-wrapper input[type="text"]::placeholder {
  color: #aaa;
}
</style>