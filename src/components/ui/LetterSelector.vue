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
  <div class="start-letters-container">
    <div class="start-letters-wrap">
      <div class="start-letters">
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

<style scoped>
.start-letters-container {
  width: 100%;
  position: relative;
}

.start-letters-wrap {
  width: 100%;
  position: relative;
  overflow-x: scroll;
  overflow-y: hidden;
  -ms-overflow-style: none; /* Internet Explorer 10+ */
  scrollbar-width: none; /* Firefox */
}

.start-letters-wrap::-webkit-scrollbar {
  display: none; /* Safari and Chrome */
}

.start-letters {
  display: inline-flex;
  flex-direction: row;
  flex-wrap: nowrap;
  padding: 0px;
}

.start-letter {
  background: none;
  border: none;
  color: rgb(100, 100, 100);
  font-size: 14px;
  padding: 28px 14px 28px 14px;
}

.start-letter.slim {
  padding-top: 8px;
  padding-bottom: 8px;
}

.start-letter.selected {
  font-weight: bold;
  color: black;
}

@media (min-width: 768px) {
  .start-letters-wrap {
    overflow-x: auto;
    overflow-y: auto;
    padding: 14px 0px 14px 0px;
  }

  .start-letters {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    padding: 0px 0px 0px 0px;
  }

  .start-letter {
    background: none;
    border: none;
    color: rgb(100, 100, 100);
    font-size: 14px;
    padding: 28px 8px 28px 8px;
  }

  .start-letter.slim {
    padding-top: 4px;
    padding-bottom: 4px;
  }
}

@media (orientation: landscape ) {
  .start-letters-wrap {
    padding: 0;
  }
}

@media ((orientation: landscape) and (min-width: 1280px) ) {
  .start-letters-wrap {
    padding: 14px 0px 14px 0px;
  }
}

</style>