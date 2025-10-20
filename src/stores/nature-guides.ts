import { toRaw } from 'vue';
import { defineStore } from 'pinia';
import { IdentificationStep } from 'localcosmos-client';
import type { Features, NatureGuideComponent } from 'localcosmos-client';
import { inject } from 'vue';

interface State {
  natureGuide: NatureGuideComponent | null;
  currentStep: IdentificationStep | null;
  currentStepUuid: string | null;
  identificationStepHistory: IdentificationStep[];
  resetCounter: number;
}

export const useNatureGuideStore = defineStore('natureGuide', {

  state: (): State => ({
    natureGuide: null,
    currentStep: null,
    currentStepUuid: null,
    identificationStepHistory: [],
    resetCounter: 0,
  }),

  getters: {
    currentStepIsRootStep: state => state.currentStepUuid === state.natureGuide?.startNodeUuid,
    
    startNodeSlug: state => {
      if (!state.natureGuide?.startNodeUuid || !state.natureGuide?.slugs) {
        return null;
      }
      // Find slug by UUID (reverse lookup)
      const startUuid = state.natureGuide.startNodeUuid;
      return Object.keys(state.natureGuide.slugs).find(
        slug => state.natureGuide?.slugs[slug] === startUuid
      ) || null;
    },
  },

  actions: {
    async loadNatureGuide (slug: string) {
      if (this.natureGuide?.slug === slug) {
        return;
      }

      //console.log('Loading nature guide:', slug);
      const features = inject('features') as Features;
      if (features.NatureGuide){
        const natureGuideUuid = features.NatureGuide.list.find(natureGuide => natureGuide.slug === slug)?.uuid;
        const response = await fetch(`/localcosmos/features/NatureGuide/${natureGuideUuid}/${natureGuideUuid}.json`);
        const data = await response.json();
        this.natureGuide = toRaw(data);
      }
    },

    loadIdentificationStep (stepUuid: string) {
      if (!this.natureGuide) {
        throw new Error('No nature guide loaded');
      }

      //console.log('Loading identification step:', stepUuid);

      this.currentStepUuid = stepUuid;
      const stepData = this.natureGuide.tree[stepUuid];
      const step = new IdentificationStep(stepData);

      this.currentStep = step;
    },

    loadIdentificationStepBySlug (slug: string) {
      if (!this.natureGuide) {
        throw new Error('No nature guide loaded');
      }

      if (this.identificationStepHistory.length > 0 && slug === this.identificationStepHistory[this.identificationStepHistory.length - 1].slug) {
        const step = this.identificationStepHistory.pop();

        if (step) {
          this.currentStep = step;
          this.currentStepUuid = this.currentStep?.uuid;
        }
      } else {
        const stepUuid = this.natureGuide.slugs[slug];
        this.loadIdentificationStep(stepUuid);
      }
    },

    resetIdentificationStep () {
      if (this.currentStepUuid) {
        this.loadIdentificationStep(this.currentStepUuid);
        this.resetCounter++;
      }
    },

    pushLastStep () {
      if (this.currentStep) {
        this.identificationStepHistory.push(this.currentStep);
      }
    },

    resetNodeStack () {
      this.identificationStepHistory = [];
    }
  },
});
