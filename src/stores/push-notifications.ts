import { defineStore } from 'pinia';
import { ref, inject } from 'vue';
import type { LocalCosmosApi, FCMDeviceType } from 'localcosmos-client';
import { LCApiResultTypes } from 'localcosmos-client';
import { useAuthStore } from '@/stores/auth';
import { useLanguageStore } from '@/stores/language';
import type { PushPayload, PushNotification } from '@/types/push-notifications';

const PUSH_OPTED_IN_KEY = 'push_opted_in';
const PUSH_LAST_TOKEN_KEY = 'push_last_token';

// Typed accessor for the Cordova plugin
const getMessaging = (): any | null => {
  try {
    return (window as any).cordova?.plugins?.firebase?.messaging ?? null;
  } catch {
    return null;
  }
};

export const usePushNotificationsStore = defineStore('push-notifications', () => {
  const LCApi = inject('LCApi') as LocalCosmosApi;
  const authStore = useAuthStore();
  const languageStore = useLanguageStore();

  const stored = localStorage.getItem(PUSH_OPTED_IN_KEY);
  const pushOptedIn = ref<boolean>(stored !== null ? JSON.parse(stored) : false);
  const fcmToken = ref<string | null>(null);
  const isRegistering = ref<boolean>(false);
  const error = ref<string | null>(null);
  const foregroundNotification = ref<PushNotification | null>(null);
  let _dismissTimer: ReturnType<typeof setTimeout> | null = null;

  const getDeviceType = (): FCMDeviceType => {
    // @ts-ignore
    const platform = (typeof device !== 'undefined' ? device.platform : 'browser').toLowerCase();
    if (platform === 'android') return 'android';
    if (platform === 'ios') return 'ios';
    return 'browser';
  };

  const registerWithServer = async (token: string): Promise<boolean> => {
    const clientId = authStore.getDeviceUuid();
    const result = await LCApi.registerFCMDevice({
      registration_id: token,
      type: getDeviceType(),
      clientId,
      languageCode: languageStore.currentLanguage,
    });

    if (result.type === LCApiResultTypes.success) {
      localStorage.setItem(PUSH_LAST_TOKEN_KEY, token);
      return true;
    }
    return false;
  };

  const wireCallbacks = (): void => {
    const messaging = getMessaging();
    if (!messaging) return;

    // onTokenRefresh fires with no args; re-fetch and re-register
    messaging.onTokenRefresh(async () => {
      try {
        const newToken = await messaging.getToken();
        fcmToken.value = newToken;
        await registerWithServer(newToken);
      } catch {
        // token refresh failed silently
      }
    });

    messaging.onMessage((payload: PushPayload) => {
      const apsAlert = payload.aps?.alert;
      const title =
        payload.gcm?.title ??
        payload.data?.title ??
        (typeof apsAlert === 'object' ? apsAlert?.title : apsAlert) ??
        '';
      const body =
        payload.gcm?.body ??
        payload.data?.body ??
        (typeof apsAlert === 'object' ? apsAlert?.body : undefined) ??
        '';

      if (!title && !body) return;

      if (_dismissTimer) clearTimeout(_dismissTimer);
      foregroundNotification.value = { title: String(title), body: String(body), payload };
      _dismissTimer = setTimeout(() => { foregroundNotification.value = null; }, 5000);
    });

    messaging.onBackgroundMessage((payload: PushPayload) => {
      console.log('FCM background message:', payload);
    });
  };

  const enable = async (): Promise<void> => {
    const messaging = getMessaging();
    if (!messaging) return;

    error.value = null;
    isRegistering.value = true;
    pushOptedIn.value = true;
    localStorage.setItem(PUSH_OPTED_IN_KEY, 'true');

    try {
      // requestPermission triggers the OS dialog on iOS and Android 13+; on Android 10–12 it resolves immediately (permission granted at install)
      await messaging.requestPermission({ forceShow: false });
      const token = await messaging.getToken();
      fcmToken.value = token;
      const ok = await registerWithServer(token);
      if (ok) {
        wireCallbacks();
      } else {
        error.value = 'push.registrationFailed';
        pushOptedIn.value = false;
        // Remove rather than set false so promptIfNeeded retries on next boot
        localStorage.removeItem(PUSH_OPTED_IN_KEY);
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e);
      pushOptedIn.value = false;
      localStorage.removeItem(PUSH_OPTED_IN_KEY);
    } finally {
      isRegistering.value = false;
    }
  };

  const disable = async (): Promise<void> => {
    error.value = null;
    pushOptedIn.value = false;
    localStorage.setItem(PUSH_OPTED_IN_KEY, 'false');
    isRegistering.value = true;

    try {
      try {
        await LCApi.deregisterFCMDevice({ clientId: authStore.getDeviceUuid() });
      } catch {
        // best-effort server deregistration
      }

      const messaging = getMessaging();
      if (messaging) {
        try {
          await messaging.deleteToken();
        } catch {
          // best-effort token deletion
        }
      }

      fcmToken.value = null;
      localStorage.removeItem(PUSH_LAST_TOKEN_KEY);
    } finally {
      isRegistering.value = false;
    }
  };

  // Called on boot when already opted in to re-register if token rotated
  const syncTokenIfNeeded = async (): Promise<void> => {
    if (!pushOptedIn.value) return;

    const messaging = getMessaging();
    if (!messaging) return;

    error.value = null;

    try {
      const token = await messaging.getToken();
      fcmToken.value = token;
      const lastToken = localStorage.getItem(PUSH_LAST_TOKEN_KEY);
      if (token !== lastToken) {
        await registerWithServer(token);
      }
      wireCallbacks();
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e);
    }
  };

  // Show OS permission dialog on first launch; sync token on subsequent launches if already opted in
  const promptIfNeeded = async (): Promise<void> => {
    if (!getMessaging()) return;
    const stored = localStorage.getItem(PUSH_OPTED_IN_KEY);
    if (stored === null) {
      await enable();
    } else if (pushOptedIn.value) {
      await syncTokenIfNeeded();
    }
  };

  const dismissForegroundNotification = (): void => {
    if (_dismissTimer) clearTimeout(_dismissTimer);
    foregroundNotification.value = null;
  };

  return {
    pushOptedIn,
    fcmToken,
    isRegistering,
    error,
    foregroundNotification,
    enable,
    disable,
    syncTokenIfNeeded,
    promptIfNeeded,
    dismissForegroundNotification,
  };
});
