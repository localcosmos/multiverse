import { defineStore } from 'pinia';

export const MODAL_TYPES = {
  BURGER: 'burger',
  MODAL: 'modal',
  FULLSCREEN: 'fullscreen',
  IMAGE_GALLERY: 'imageGallery',
  LOGIN: 'login',
  DELETE_ACCOUNT: 'deleteAccount',
  PROFILE_PICTURE: 'profilePicture',
  DELETE_PROFILE_PICTURE: 'deleteProfilePicture',
  DELETE_PICTURE: 'deletePicture',
  DELETE_OBSERVATION: 'deleteObservation',
  GPS_INPUT: 'gpsInput',
  IMAGE_UPLOAD_PROGRESS: 'imageUploadProgress',
  SYNC_OBSERVATIONS: 'syncObservations',
} as const;

type ModalType = typeof MODAL_TYPES[keyof typeof MODAL_TYPES] | string;

export const useModalsStore = defineStore('modals', {
  state: () => ({
    open: '' as ModalType,
    id: '',
  }),
  getters: {
    isOpen: (state) => (type: ModalType) => state.open === type,
  },
  actions: {
    openModal(type: ModalType, id?: string) {
      this.open = '';
      this.id = '';
      // Push a new state for any modal (not just burger)
      if (!window.history.state || window.history.state.modalType !== type) {
        window.history.pushState({ ...window.history.state, modalType: type }, '', window.location.href);
      }
      this.open = type;
      if (id) this.id = id;
    },
    closeModal() {
      // If a modal is open and the current history state matches, go back
      if (this.open && window.history.state && window.history.state.modalType === this.open && this.open !== '') {
        window.history.back();
      }
      this.open = '';
      this.id = '';
    },
    isModalOpen(type: ModalType): boolean {
      return this.open === type;
    }
  },
});
