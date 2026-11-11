<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue';
import { useLetterSelectorStore } from '@/stores/letter-selector'; // Import the letter-selector store
import type { ComputedRef } from 'vue';

interface Props {
  id: string; // Mandatory ID for the LetterSelector
  letters?: string[];
  initialLetter?: string | null;
  slim?: boolean; // Optional prop to indicate if the selector should be slim
}

const emit = defineEmits(['select', 'unselect']);
const props = withDefaults(defineProps<Props>(), {
  slim: false,
});

// Initialize the letter-selector store
const letterSelectorStore = useLetterSelectorStore();

// Register the LetterSelector in the store
letterSelectorStore.registerLetterSelector(props.id);

// Reactive variable for the current letter
// the initial letter should be: letterSelectorStore.getSelectedLetter(props.id), fallback1: props.initialLetter, fallback2: null
const currentLetter = ref<string | null>(letterSelectorStore.getSelectedLetter(props.id) ?? props.initialLetter ?? null);

// Watch for changes in `currentLetter` and update the store
watch(currentLetter, (newLetter) => {
  if (newLetter) {
    letterSelectorStore.setSelectedLetter(props.id, newLetter);
  }
});

// Emit the initially selected letter on component mount
onMounted(() => {
  if (currentLetter.value) {
    emit('select', currentLetter.value);
  }
});

// Computed property for usable letters
const usableLetters: ComputedRef<string[]> = computed(() => {
  if (props.letters) {
    return props.letters;
  } else {
    return Array(26)
      .fill(0)
      .map((_, i) => String.fromCharCode(65 + i))
      .concat(['Ä', 'Ö', 'Ü']);
  }
});

// Select the previous letter
const selectPreviousLetter = () => {
  if (currentLetter.value) {
    const currentIndex = usableLetters.value.indexOf(currentLetter.value);
    if (currentIndex > 0) {
      currentLetter.value = usableLetters.value[currentIndex - 1];
      emit('select', currentLetter.value);
    }
  }
};

// Select the next letter
const selectNextLetter = () => {
  if (currentLetter.value) {
    const currentIndex = usableLetters.value.indexOf(currentLetter.value);
    if (currentIndex < usableLetters.value.length - 1) {
      currentLetter.value = usableLetters.value[currentIndex + 1];
      emit('select', currentLetter.value);
    }
  }
};

// Select or unselect a letter
const selectLetter = (letter: string) => {
  if (letter === currentLetter.value) {
    currentLetter.value = null;
    emit('unselect');
  } else {
    currentLetter.value = letter;
    emit('select', letter);
  }
};
</script>

<template>
  <div class="letter-selector">
    <div class="letter-selector__start-letters-wrap">
      <div class="letter-selector__start-letters">
        <button
          v-for="letter in usableLetters"
          :key="letter"
          class="start-letter cursor-pointer"
          :class="[
            letter === currentLetter ? 'selected' : '',
            props.slim ? 'slim' : ''
          ]"
          @click="selectLetter(letter)"
        >
          {{ letter }}
        </button>
      </div>
    </div>
  </div>
</template>

<style>
@layer defaults {
  :root {
    --letter-selector-background-color: none;
    --letter-selector-letters-color: rgb(100, 100, 100);
    --letter-selector-selected-letter-color: rgb(0, 0, 0);

    --darkmode-letter-selector-background-color: none;
    --darkmode-letter-selector-letters-color: rgb(150, 150, 150);
    --darkmode-letter-selector-selected-letter-color: rgb(255, 255, 255);
  }
}

.letter-selector {
  width: 100%;
  position: relative;
  background: var(--letter-selector-background-color);
}

body.dark .letter-selector {
  background: var(--darkmode-letter-selector-background-color);
}

.letter-selector__start-letters-wrap {
  width: 100%;
  position: relative;
  overflow-x: scroll;
  overflow-y: hidden;
  -ms-overflow-style: none; /* Internet Explorer 10+ */
  scrollbar-width: none; /* Firefox */
}

.letter-selector__start-letters-wrap::-webkit-scrollbar {
  display: none; /* Safari and Chrome */
}

.letter-selector__start-letters {
  display: inline-flex;
  flex-direction: row;
  flex-wrap: nowrap;
  padding: 0px;
}

.letter-selector .start-letter {
  background: none;
  border: none;
  color: var(--letter-selector-letters-color);
  font-size: 14px;
  padding: 28px 14px 28px 14px;
}

body.dark .letter-selector .start-letter {
  color: var(--darkmode-letter-selector-letters-color);
}

.letter-selector .start-letter.slim {
  padding-top: 14px;
  padding-bottom: 14px;
}

.letter-selector .start-letter.selected {
  font-weight: bold;
  color: var(--letter-selector-selected-letter-color);
}

body.dark .letter-selector .start-letter.selected {
  color: var(--darkmode-letter-selector-selected-letter-color);
}


@media (min-width: 768px) {
  .letter-selector__start-letters-wrap {
    overflow-x: scroll;
    overflow-y: hidden;
  }

  .letter-selector .start-letter {
    font-size: 14px;
    padding: 28px 14px 28px 14px;
  }

  .letter-selector .start-letter.slim {
    padding-top: 14px;
    padding-bottom: 14px;
  }
}

@media (orientation: landscape) {
  .letter-selector__start-letters-wrap {
    padding: 0;
  }
}

@media ((orientation: landscape) and (min-width: 1280px)) {
  .letter-selector__start-letters-wrap {
  }
}
</style>
