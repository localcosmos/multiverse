<script setup lang="ts">
import { ref } from 'vue';
import { t } from 'i18next';
import { useRouter } from 'vue-router';
import * as Yup from 'yup';
import type { AnyObjectSchema } from 'yup';
import { useAuthStore } from '@/stores/auth';

import { PhUser, PhPassword, PhEnvelope, PhIdentificationCard } from '@phosphor-icons/vue';

import ContentContainer from '@/components/container/ContentContainer.vue';
import BasicFormField from '@/components/forms/fields/BasicFormField.vue';
import FormWrapper from '@/components/forms/FormWrapper.vue';
import AsyncButton from '@/components/ui/AsyncButton.vue';
import type { Registration } from 'localcosmos-client';
import type { ServerErrorMessages } from '@/composables/parseServerErrors';
import { NON_FIELD_ERROR_KEY } from '@/composables/parseServerErrors';

const authStore = useAuthStore();
const router = useRouter();

const registrationParameters = ref<Registration>({
  email: '',
  email2: '',
  firstName: '',
  lastName: '',
  password: '',
  password2: '',
  username: '',
  clientId: authStore.getDeviceUuid(),
  //  @ts-ignore
  platform: device.platform,
});

const loading = ref<boolean>(false);

const validation: AnyObjectSchema =  Yup.object({
  username: Yup.string().required().min(4),
  password: Yup.string().required().min(8),
  password2: Yup.string().required().min(8).oneOf([Yup.ref('password'), ''], t('validation.passwordMismatch')),
  email: Yup.string().required().email(),
  email2: Yup.string().required().email().oneOf([Yup.ref('email'), ''], t('validation.emailMismatch')),
  firstName: Yup.string(),
  lastName: Yup.string(),
});


const onSubmit = async (data:Record<string, any>, setServerErrors: Function) => {
  if (loading.value) {
    return;
  }

  loading.value = true;
  const user = await authStore.register(registrationParameters.value);

  loading.value = false;

  if (authStore.isAuthenticated) {
    await router.push({ name: 'registration-success' });
  } else {
    if (authStore.serverErrors) {
      setServerErrors(authStore.serverErrors);
    } else if (authStore.error) {
      const serverErrors: ServerErrorMessages = {};
      serverErrors[NON_FIELD_ERROR_KEY] = authStore.error;
      setServerErrors(serverErrors);
    }
  }
};

</script>

<template>
  <ContentContainer>
    <div class="page page-padding">
      <div class="form-page-container">
        <div class="my-xl">
          <h1 class="h1">
            {{ $t('registration.title') }}
          </h1>
        </div>
        <div>
          <div>
            <FormWrapper :validation="validation" @submit="onSubmit">
              <BasicFormField
                v-model="registrationParameters.username"
                name="username"
                :label="$t('user.username')"
                type="text"
                :icon="PhUser"
              />
              <BasicFormField
                v-model="registrationParameters.email"
                name="email"
                :label="$t('user.email')"
                type="email"
                :icon="PhEnvelope"
              />
              <BasicFormField
                v-model="registrationParameters.email2"
                name="email2"
                :label="$t('user.email2')"
                type="email"
              />
              <BasicFormField
                v-model="registrationParameters.firstName"
                name="firstName"
                :label="$t('user.firstName')"
                type="text"
                :required="false"
                :icon="PhIdentificationCard"
              />
              <BasicFormField
                v-model="registrationParameters.lastName"
                name="lastName"
                :label="$t('user.lastName')"
                type="text"
                :required="false"
                :icon="PhIdentificationCard"
              />
              <BasicFormField
                v-model="registrationParameters.password"
                name="password"
                :label="$t('user.password')"
                type="password"
                :icon="PhPassword"
              />
              <BasicFormField
                v-model="registrationParameters.password2"
                name="password2"
                :label="$t('user.password2')"
                type="password"
              />
              <template #actions>
                <AsyncButton
                  :submitting="loading"
                  :text="t('registration.register')"
                >
                </AsyncButton>
              </template>
            </FormWrapper>
          </div>
        </div>
      </div>
    </div>
  </ContentContainer>
</template>

<style scoped>
@media (min-width: 640px) {
}

@media (min-width: 768px) {

}

@media (min-width: 1024px) {

}

@media (min-width: 1280px) {

}

@media (min-width: 1536px) {

}
</style>