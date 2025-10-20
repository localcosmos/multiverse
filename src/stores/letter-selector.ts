import { defineStore } from 'pinia';

interface LetterDict {
  selectedLetter: string | null;
}

type Letters = Record<string, LetterDict>;

export const useLetterSelectorStore = defineStore('letterSelector', {
  state: () => ({
    letters: {} as Letters, // Store for managing selected letters by ID
  }),
  actions: {
    registerLetterSelector(selectorId: string) {
      if (!this.letters[selectorId]) {
        this.letters[selectorId] = { selectedLetter: null }; // Initialize with no selected letter
      }
    },
    setSelectedLetter(selectorId: string, letter: string) {
      if (this.letters[selectorId]) {
        this.letters[selectorId].selectedLetter = letter; // Set the selected letter
      }
    },
    getSelectedLetter(selectorId: string): string | null {
      return this.letters[selectorId]?.selectedLetter ?? null; // Retrieve the selected letter
    },
  },
});