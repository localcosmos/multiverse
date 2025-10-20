import { defineStore } from 'pinia';
import { inject, computed } from 'vue';
import type { ComputedRef } from 'vue';

import { useAuthStore } from '@/stores/auth';
import type { Features, FrontendSettings } from 'localcosmos-client';

export const usePermissionsStore = defineStore('permissions', () => {
  const settings = inject('settings') as FrontendSettings;
  const features = inject('features') as Features; // Adjust type as needed
  const authStore = useAuthStore();

  // Explicitly type the computed ref as ComputedRef<boolean>
  const canUseDatasets: ComputedRef<boolean> = computed(() => {
    if (features.GenericForm){
      if (settings.OPTIONS.allowAnonymousObservations == true)
        return true
      }
      else {
        if (authStore.isAuthenticated) {
          return true;
        }
    }
    return false;
  });

  return {
    canUseDatasets,
  };

});