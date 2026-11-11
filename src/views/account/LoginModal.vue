<script setup lang="ts">
import { ref, inject, computed, nextTick } from "vue";
import { useModalsStore } from "@/stores/modals";
import type { FrontendSettings } from "localcosmos-client";
import * as Yup from "yup";
import { useAuthStore } from "@/stores/auth";
import type { TokenObtainPairSerializerWithClientID, LocalCosmosApi } from "localcosmos-client";
import { LCApiResultTypes } from "localcosmos-client";
import { t } from "i18next";
import { useRoute, useRouter } from "vue-router";

import FormWrapper from "@/components/forms/FormWrapper.vue";
import BasicFormField from "@/components/forms/fields/BasicFormField.vue";
import ColorButton from "@/components/ui/ColorButton.vue";
import AsyncButton from "@/components/ui/AsyncButton.vue";
import PasswordResetFlow from "@/components/modals/PasswordResetFlow.vue";
import type { AnyObjectSchema } from "yup";

import { PhUser, PhPassword } from "@phosphor-icons/vue";
import { NON_FIELD_ERROR_KEY } from "@/composables/parseServerErrors";
import type { ServerErrorMessages } from "@/composables/parseServerErrors";

const LCApi = inject('LCApi') as LocalCosmosApi;
const settings = inject('settings') as FrontendSettings;
const modals = useModalsStore();
const authStore = useAuthStore();
const route = useRoute();
const router = useRouter();

const appName = settings.NAME;

// ── step management ──────────────────────────────────────────────────────────
type Step = 'login' | 'resetFlow';
type ResetContext = 'migration' | 'manual';

const step = ref<Step>('login');
const resetContext = ref<ResetContext>('manual');

// ── login step ───────────────────────────────────────────────────────────────
const loading = ref<boolean>(false);
const hasServerError = ref<boolean>(false);

const initialData = {
  username: "",
  password: "",
};

const validation: AnyObjectSchema = Yup.object({
  username: Yup.string().min(3).required(),
  password: Yup.string().min(8).required(),
});

const onSubmit = async (data: Record<string, any>, setServerErrors: Function) => {
  if (loading.value) {
    return;
  }

  loading.value = true;

  const loginParameters: TokenObtainPairSerializerWithClientID = {
    username: data.username,
    password: data.password,
    // @ts-ignore
    platform: device.platform,
    clientId: authStore.getDeviceUuid(),
  };

  await authStore.login(loginParameters);

  if (authStore.user) {
    modals.closeModal();
    if (route.query.redirect) {
      router.push({ path: route.query.redirect.toString() });
    } else {
      router.push({ name: "home" });
    }
  } else {
    const err = authStore.serverErrors as any;
    if (err?.code === 'migration_password_reset_required') {
      resetContext.value = 'migration';
      step.value = 'resetFlow';
    } else if (authStore.serverErrors) {
      setServerErrors(authStore.serverErrors);
      hasServerError.value = true;
    } else if (authStore.error) {
      const serverErrors: ServerErrorMessages = {};
      serverErrors[NON_FIELD_ERROR_KEY] = authStore.error;
      setServerErrors(serverErrors);
      hasServerError.value = true;
    }
  }
  loading.value = false;
};

const onResetFlowSuccess = () => {
  step.value = 'login';
  resetContext.value = 'manual';
};

const onResetFlowBack = () => {
  step.value = 'login';
  resetContext.value = 'manual';
};
</script>

<template>
  <div class="login-modal">
    <!-- authenticated ─────────────────────────────────────────────────────── -->
    <div v-if="authStore.isAuthenticated">
      <div class="alert alert-success">
        <span class="icon"><PhUser /></span>
        {{ $t("You are logged in as") }} {{ authStore.user?.username }}
      </div>
    </div>

    <div v-else>

      <!-- step: login ───────────────────────────────────────────────────────── -->
      <div v-if="step === 'login'">
        <FormWrapper :validation="validation" :initial-data="initialData" @submit="onSubmit">
          <BasicFormField name="username" label="Benutzername" type="text" :icon="PhUser" />
          <BasicFormField name="password" label="Passwort" type="password" :icon="PhPassword" />
          <template #actions>
            <AsyncButton :text="t('Login')" :submitting="loading" />
          </template>
        </FormWrapper>
        <div class="password-reset-container" v-if="hasServerError">
          <ColorButton
            :text="$t('passwordReset.resetPassword')"
            size="medium"
            type="danger"
            @click="step = 'resetFlow'"
          />
        </div>
        <div class="login-modal-actions">
          <div class="flex">
            <RouterLink :to="{ name: 'register' }" class="nolinkstyle">
              <ColorButton :text="$t('registration.RegisterHere')" size="medium" type="success" />
            </RouterLink>
          </div>
        </div>
      </div>

      <!-- step: resetFlow ──────────────────────────────────────────────────────── -->
      <div v-else-if="step === 'resetFlow'">
        <PasswordResetFlow
          :context="resetContext"
          :appName="appName"
          :show-back-button="true"
          @success="onResetFlowSuccess"
          @back="onResetFlowBack"
        />
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

.login-modal-actions .cbtn {
  width: 100%;
  justify-content: center;
}
</style>
