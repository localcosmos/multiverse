import { markRaw } from 'vue';
import { defineStore } from 'pinia';

export type ModalAction = {
    label: string,
    callback: (props?: any) => void,
  };

export type BottomSheet = {
  mode: 'expanded' | 'hidden' | 'collapsed',
  view: object | null,
  title: string,
  collapsedView: object | null,
};

export const useModalBottomSheet = defineStore('modalbottomsheet', {
  state: (): BottomSheet => ({
    mode: 'hidden',
    title: '',
    view: null,
    collapsedView: null,
  }),
  actions: {
    create(view: object, title: string, collapsedView: object) {
      this.mode = 'hidden';
      // using markRaw to avoid over performance as reactive is not required
      this.view = markRaw(view);
      this.collapsedView = markRaw(collapsedView);
      this.title = title;
      document.body.classList.add('modal-open');
    },
    destroy() {
      this.mode = 'hidden';
      this.view = null;
      this.title = '';
      document.body.classList.remove('modal-open');
    },
    collapse() {
      this.mode = 'collapsed';
      document.body.classList.remove('modal-open');
    },
    expand() {
      this.mode = 'expanded';
      document.body.classList.add('modal-open');
    }
  },
});

export default useModalBottomSheet;
