<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useModalsStore } from '@/stores/modals';
import * as Yup from 'yup';
import { useAuthStore } from '@/stores/auth';
import type { TokenObtainPairSerializerWithClientID } from 'localcosmos-client';
import { t } from 'i18next';
import { useRoute, useRouter } from 'vue-router';

import FormWrapper from '@/components/forms/FormWrapper.vue';
import BasicFormField from '@/components/forms/fields/BasicFormField.vue';
import ColorButton from '@/components/ui/ColorButton.vue';
import AsyncButton from '@/components/ui/AsyncButton.vue';
import type { AnyObjectSchema } from 'yup';

import { PhUser, PhPassword } from '@phosphor-icons/vue';
import { NON_FIELD_ERROR_KEY } from '@/composables/parseServerErrors';
import type { ServerErrorMessages } from '@/composables/parseServerErrors';

const modals = useModalsStore();
const authStore = useAuthStore();
const route = useRoute();
const router = useRouter();

const loading = ref<boolean>(false);

const loginParameters = ref<TokenObtainPairSerializerWithClientID>({
	username: '',
	password: '',
  // @ts-ignore
	platform: device.platform,
	clientId: authStore.getDeviceUuid(),
});

const validation: AnyObjectSchema = Yup.object({
	username: Yup.string().min(3).required(),
	password: Yup.string().min(8).required(),
});

const onSubmit = async (data: Record<string, any>, setServerErrors:Function) => {
	if (loading.value) {
		return;
	}

	loading.value = true;
	await authStore.login(loginParameters.value);

  if (authStore.user) {
    // close the login modal
    modals.closeModal();

    if (route.query.redirect) {
			router.push({ path: route.query.redirect.toString() });
		} else {
			router.push({ name: 'home' });
		}
  }
  else {
    // pass server erros to formwrapper
    if (authStore.serverErrors) {
      setServerErrors(authStore.serverErrors);
    } else if (authStore.error) {
      const serverErrors: ServerErrorMessages = {};
      serverErrors[NON_FIELD_ERROR_KEY] = authStore.error;
      setServerErrors(serverErrors);
    }
  }
	loading.value = false;
};

const logout = () => {
  authStore.logout();
};
</script>

<template>
  <div class="login-modal">
    <div v-if="authStore.isAuthenticated">
      <div class="alert alert-success">
        <span class="icon"><PhUser /></span>
        {{ $t('You are logged in as') }} {{ authStore.user?.username }}
      </div>
    </div>
    <div v-else>
      <FormWrapper
        :validation="validation"
        @submit="onSubmit"
      >
        <BasicFormField
          v-model="loginParameters.username"
          name="username"
          label="Benutzername"
          type="text"
          :icon="PhUser"
        />
        <BasicFormField
          v-model="loginParameters.password"
          name="password"
          label="Passwort"
          type="password"
          :icon="PhPassword"
        />
        <template #actions>
          <AsyncButton :text="t('Login')" :submitting="loading" />
        </template>
      </FormWrapper>
      <div class="login-modal-actions">
        <div class="flex">
          <RouterLink :to="{ name: 'password-reset' }" class="nolinkstyle">
            <ColorButton
              :text="$t('passwordReset.resetPassword')"
              size="medium"
              type="default"
            />
          </RouterLink>
        </div>
        <div class="flex">
          <RouterLink :to="{ name: 'register' }" class="nolinkstyle">
            <ColorButton
              :text="$t('registration.RegisterHere')"
              size="medium"
              type="success"
            />
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-modal-actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1.5rem;
  align-items: stretch;
}
.login-modal-actions .pill-link {
  width: 100%;
  justify-content: center;
}
</style>