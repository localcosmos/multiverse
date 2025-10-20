import type { LocalCosmosApi, TokenRefresh, LocalcosmosUser, LocalcosmosUserUpdateData, TokenObtainPairSerializerWithClientID, Registration } from 'localcosmos-client';
import { LCApiResultTypes } from 'localcosmos-client';
import { ref, computed, inject } from 'vue';
import { defineStore } from 'pinia';
import router from '@/router';
import i18next from 'i18next';
import type { ServerErrorTypes, LCApiRequestResult, CropParameters } from 'localcosmos-client';

const USER_DATA_KEY = 'user_data';
const REFRESH_TOKEN_KEY = 'refresh_token';
const REFRESH_TIMEOUT = 1000 * 60 * 59; // 59 minutes
const DEVICE_UUID_KEY = 'device_uuid';

export const useAuthStore = defineStore('auth', () => {

  const LCApi = inject('LCApi') as LocalCosmosApi;

  /** properties */
  const token = ref<TokenRefresh | null>(null);
  const user = ref<LocalcosmosUser | null>(null);
  const refreshTimeoutId = ref<ReturnType<typeof setTimeout> | null>(null);
  const serverErrors = ref<ServerErrorTypes | null>(null); // For form binding, do not parse the errors in the store. They are parsed in FormWrapper.vue
  const error = ref<string | null>(null); // For global/general errors
  const redirectAfterLogin = ref<string | null>(null);

  /** getters */
  const isAuthenticated = computed(() => !!token.value?.access);

  // only the token is stored in localStorage, not the user. This loads the user from the API
  const loadUser = async () => {

    if (isAuthenticated.value && user.value !== null) {
      return;
    }

    serverErrors.value = null;
    error.value = null;

    // If offline, try to load user from localStorage
    if (!navigator.onLine) {
      const storedUser = localStorage.getItem(USER_DATA_KEY);
      if (storedUser) {
        try {
          user.value = JSON.parse(storedUser);
        } catch (e) {
          user.value = null;
          error.value = i18next.t('auth.userLoadFailed');
        }
      } else {
        user.value = null;
        error.value = i18next.t('auth.userNotAvailableOffline');
      }
      return;
    }

    // Online: use refresh token from store if available, otherwise from localStorage
    const refreshTokenToUse = token.value?.refresh || localStorage.getItem(REFRESH_TOKEN_KEY);
    if (refreshTokenToUse) {
      try {
        // Refresh the access token
        const refreshResult = await LCApi.refreshToken(refreshTokenToUse);
        if (refreshResult.type === LCApiResultTypes.success) {
          token.value = {
            refresh: refreshTokenToUse,
            access: refreshResult.data.access,
          } as TokenRefresh;
          // Now fetch the user with the new access token
          const userResult = await LCApi.getUser(refreshResult.data.access);
          if (userResult.type === LCApiResultTypes.success) {
            const userData = userResult.data as LocalcosmosUser;
            localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
            user.value = userData;
          } else {
            serverErrors.value = userResult.error;
          }
        } else {
          serverErrors.value = refreshResult.error;
          token.value = null;
          user.value = null;
        }
      } catch (e) {
        error.value = i18next.t('auth.userLoadFailed');
        token.value = null;
        user.value = null;
      }
    } else {
      user.value = null;
      token.value = null;
      error.value = i18next.t('auth.noRefreshToken');
    }
  };

  const login = async (userParams: TokenObtainPairSerializerWithClientID): Promise<LocalcosmosUser | null> => {
    serverErrors.value = null;
    error.value = null;
    try {
      const result = await LCApi.login(userParams);

      if (result.type === LCApiResultTypes.success) {
        token.value = result.data as TokenRefresh;
        localStorage.setItem(REFRESH_TOKEN_KEY, token.value.refresh);
        await loadUser();
      } else {
        serverErrors.value = result.error;
      }
    } catch (err) {
      error.value = i18next.t('auth.unexpectedLoginError');
    }
    return null;
  };

  const removeTokenAndUser = async () => {
    try {
      if (refreshTimeoutId.value) {
        clearTimeout(refreshTimeoutId.value);
        refreshTimeoutId.value = null;
      }
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      if (token.value) {
        try {
          await LCApi.blacklistToken(token.value.refresh);
        } catch (err) {
          // Optionally log: console.warn('Failed to blacklist token', err);
        }
      }
      token.value = null;
      user.value = null;
    } catch (err) {
      error.value = i18next.t('auth.clearAuthFailed');
    }
  };

  const refresh = async () => {
    error.value = null;
    serverErrors.value = null;
    try {
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      if (refreshToken) {
        const result = await LCApi.refreshToken(refreshToken);
        if (result.type == LCApiResultTypes.success) {
          token.value = {
            refresh: refreshToken,
            access: result.data.access,
          } as TokenRefresh;
          refreshTimeoutId.value = setTimeout(refresh, REFRESH_TIMEOUT);
        } else {
          await logout();
        }
      }
    } catch (err) {
      error.value = i18next.t('auth.refreshFailed');
      await logout();
    }
  };

  const logout = async () => {
    try {
      await removeTokenAndUser();
    } catch (err) {
      error.value = i18next.t('auth.logoutFailed');
    }
    router.push('/');
  };

  const getDeviceUuid = (): string => {
    // @ts-ignore
    if (device.platform == 'browser'){
      let deviceUuid = localStorage.getItem(DEVICE_UUID_KEY);
      if (deviceUuid === null) {
        deviceUuid = crypto.randomUUID();
        localStorage.setItem(DEVICE_UUID_KEY, deviceUuid);
      }
      return deviceUuid;
    }
    else {
      // @ts-ignore
      return device.uuid as string;
    }
  };

  const updateUser = async (data: LocalcosmosUserUpdateData): Promise<LCApiRequestResult | null> => {
    error.value = null;
    serverErrors.value = null;
    if (!isAuthenticated.value || !token.value) {
      error.value = i18next.t('auth.notAuthenticated');
    } else {
      return await LCApi.updateAccount(token.value?.access, data);
    }

    return null;
  }

  const deleteUser = async () =>  {
    error.value = null;
    serverErrors.value = null;

    if (token.value) {
      const result = await LCApi.deleteAccount(token.value.access);
      
      if (result.type == LCApiResultTypes.success) {
        removeTokenAndUser();
        router.push({name: 'user-delete-success'});
      }
      else {
        serverErrors.value = result.error;
      }
    }
    else {
      error.value = i18next.t('auth.notAuthenticated');
    }
  }

  const register = async (data: Registration): Promise<LocalcosmosUser | null> => {

    serverErrors.value = null;
    error.value = null;

    try {
      const result = await LCApi.registerAccount(data);

      if (result.type === LCApiResultTypes.success) {
        const user = {
          username: data.username,
          password: data.password,
          clientId: data.clientId,
          platform: data.platform,
        } as TokenObtainPairSerializerWithClientID;
  
        return await login(user);
        
      } else {
        serverErrors.value = result.error;
      }
    } catch (err) {
      error.value = i18next.t('auth.unexpectedRegistrationError');
    }
    
    return null;
  }

  /** Profile picture */
  async function uploadProfilePicture (imageFilename: string, image: Blob, cropParameters: CropParameters | undefined): Promise<LCApiRequestResult | null> {
    error.value = null;
    serverErrors.value = null;
    if (!user.value || !token.value) {
      error.value = i18next.t('auth.notAuthenticated');
      return null;
    }
    return await LCApi.uploadProfilePicture(user.value.id.toString(), token.value.access, imageFilename, image, cropParameters);
  }

  async function deleteProfilePicture (): Promise<LCApiRequestResult|null> {
    error.value = null;
    serverErrors.value = null;
    if (!user.value || !token.value) {
      error.value = i18next.t('auth.notAuthenticated');
      return null;
    }
    return await LCApi.deleteProfilePicture(user.value.id.toString(), token.value.access);
  }

  const reloadUserData = async () => {
    error.value = null;
    serverErrors.value = null;
    if (!token.value?.access) {
      error.value = i18next.t('auth.notAuthenticated');
      return null;
    }
    try {
      const userResult = await LCApi.getUser(token.value.access);
      if (userResult.type === LCApiResultTypes.success) {
        const userData = userResult.data as LocalcosmosUser;
        localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
        user.value = userData;
        return userData;
      } else {
        serverErrors.value = userResult.error;
        return null;
      }
    } catch (e) {
      error.value = i18next.t('auth.userLoadFailed');
      return null;
    }
  };

  return {
    token, login, logout, refresh, user, isAuthenticated, getDeviceUuid, error, loadUser, updateUser,
    serverErrors, redirectAfterLogin, register, deleteUser, uploadProfilePicture, deleteProfilePicture, reloadUserData,
  };

});