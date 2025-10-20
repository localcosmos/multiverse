import { defineStore } from 'pinia';
import type { SimpleGeolocationPosition } from '@/types/geolocation';

const SAVED_POSITION_KEY = 'geolocation-position';

export enum GeolocationState {
  off = 'off',
  error = 'error',
  waiting = 'waiting',
  success = 'success',
}

interface State {
  status: GeolocationState,
  error: GeolocationPositionError | null,
  currentPosition: SimpleGeolocationPosition | null,
  savedPosition: SimpleGeolocationPosition | null,
  watchId: number | null,
}

export const useGeolocationStore = defineStore('geolocation', {
  state: (): State => ({
    status: GeolocationState.off,
    error: null,
    currentPosition: null,
    savedPosition: null,
    watchId: null,
  }),
  actions: {
    onPositionSuccess (position: GeolocationPosition) {
      this.status = GeolocationState.success;
      this.currentPosition = position;
      this.error = null;
    },
    onPositionError (error: GeolocationPositionError) {
      this.error = error;
      this.currentPosition = null;
      this.status = GeolocationState.error;
      if (error.code === 1) {
        // permission denied
        this.deactivateGeolocation();
      }
    },
    activateGeolocation () {
      this.status = GeolocationState.waiting;
      if (this.watchId === null) {
        this.watchId = navigator.geolocation.watchPosition(this.onPositionSuccess.bind(this), this.onPositionError.bind(this));
      }
    },
    deactivateGeolocation () {
      if (this.watchId != null) {
        navigator.geolocation.clearWatch(this.watchId);
        this.watchId = null;
      }
      this.status = GeolocationState.off;
    },
    savePosition (position: SimpleGeolocationPosition) {
      localStorage.setItem(SAVED_POSITION_KEY, JSON.stringify(position));
    },
    getSavedPosition (): SimpleGeolocationPosition | null {
      let savedPosition = null;
      const savedPositionStr = localStorage.getItem(SAVED_POSITION_KEY);
      if (savedPositionStr) {
        savedPosition = JSON.parse(savedPositionStr) as SimpleGeolocationPosition;
      }
      return savedPosition;
    },
  },
});
