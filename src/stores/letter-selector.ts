import { defineStore } from 'pinia';

interface LetterDict {
  selectedLetter: string | null;
}

type Letters = Record<string, LetterDict>;

interface OverlayState {
  active: boolean;
  letters: string[];
  selectorId: string | null;
  initialLetter: string | null;
}

export const useLetterSelectorStore = defineStore('letterSelector', {
  state: () => ({
    letters: {} as Letters, // Store for managing selected letters by ID
    overlay: {
      active: false,
      letters: [],
      selectorId: null,
      initialLetter: null,
    } as OverlayState,
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
    clearSelectedLetter(selectorId: string) {
      if (this.letters[selectorId]) {
        this.letters[selectorId].selectedLetter = null;
      }
    },
    showOverlay(selectorId: string, letters: string[], initialLetter: string | null) {
      this.overlay.active = true;
      this.overlay.selectorId = selectorId;
      this.overlay.letters = letters;
      this.overlay.initialLetter = initialLetter;
    },
    hideOverlay() {
      this.overlay.active = false;
    },
  },
});
