import { watch, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAppSettingsStore } from '@/stores/app-settings';
import { useModalsStore } from '@/stores/modals';
import type { Ref } from 'vue';

const IDLE_MS = 60_000;
const ACTIVITY_EVENTS = ['pointermove', 'pointerdown', 'keydown', 'touchstart', 'scroll'] as const;

export function useIdleTimer(active: Ref<boolean>) {
  const router = useRouter();
  const appSettings = useAppSettingsStore();
  const modals = useModalsStore();
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const reset = () => {
    if (timeoutId !== null) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      modals.closeModal();
      appSettings.setBookworm(false);
      if (router.currentRoute.value.name !== 'home') {
        router.push({ name: 'home' });
      }
    }, IDLE_MS);
  };

  const start = () => {
    ACTIVITY_EVENTS.forEach((e) => document.addEventListener(e, reset, { passive: true }));
    reset();
  };

  const stop = () => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    ACTIVITY_EVENTS.forEach((e) => document.removeEventListener(e, reset));
  };

  watch(active, (isActive) => {
    isActive ? start() : stop();
  }, { immediate: true });

  onUnmounted(stop);
}
