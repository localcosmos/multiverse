import { defineStore } from 'pinia';

export enum NetworkState {
  online = 'online',
  offline = 'offline'
}

interface State {
  isOnline: boolean
  networkState: string | null
}

export const useNetworkInformationStore = defineStore('network', {
  state: (): State => ({
    isOnline: false,
    networkState: null,
  }),
  actions: {
    check () {

      if ('device' in window) {

        // @ts-ignore
        if (device.platform === 'browser') {
          this.isOnline = true;
          this.networkState = null;
        } else if ('navigator' in window) {

          // @ts-ignore
          const onlineStates = [Connection.ETHERNET, Connection.WIFI, Connection.CELL_3G, Connection.CELL_4G, Connection.CELL];

          // @ts-ignore
          if (onlineStates.includes(navigator.connection.type)) {
            // @ts-ignore
            this.networkState = navigator.connection.type;
            this.isOnline = true;
          }
        }
      }
    },
  }
});