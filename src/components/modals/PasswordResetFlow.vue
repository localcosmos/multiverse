<script setup lang="ts">
import { ref, inject, computed, nextTick } from "vue";
import type { LocalCosmosApi } from "localcosmos-client";
import { LCApiResultTypes } from "localcosmos-client";
import * as Yup from "yup";
import { t } from "i18next";
import type { AnyObjectSchema } from "yup";

import FormWrapper from "@/components/forms/FormWrapper.vue";
import BasicFormField from "@/components/forms/fields/BasicFormField.vue";
import ColorButton from "@/components/ui/ColorButton.vue";
import AsyncButton from "@/components/ui/AsyncButton.vue";

import { PhPassword, PhCaretLeft, PhEnvelope } from "@phosphor-icons/vue";

const LCApi = inject('LCApi') as LocalCosmosApi;

interface Props {
  context?: 'migration' | 'manual' | null;
  appName?: string;
  showBackButton?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  context: null,
  appName: '',
  showBackButton: true,
});

const emit = defineEmits<{
  success: [];
  back: [];
}>();

// ── step management ──────────────────────────────────────────────────────────
type Step = 'requestToken' | 'enterToken' | 'success';

// migration: server already sent the code, skip the email-request step
const step = ref<Step>(props.context === 'migration' ? 'enterToken' : 'requestToken');
const resetEmail = ref<string>('');

// ── requestToken step ────────────────────────────────────────────────────────
const requestTokenInitialData = { email: '' };
const requestTokenValidation: AnyObjectSchema = Yup.object({
  email: Yup.string().required().email(),
});
const requestTokenLoading = ref<boolean>(false);

const onRequestToken = async (data: Record<string, any>, setServerErrors: Function) => {
  requestTokenLoading.value = true;
  const result = await LCApi.resetPasswordByToken(data.email);
  requestTokenLoading.value = false;
  if (result.type === LCApiResultTypes.success) {
    resetEmail.value = data.email;
    resetEnterTokenState();
    step.value = 'enterToken';
  } else {
    setServerErrors(result.error);
  }
};

// ── enterToken step ──────────────────────────────────────────────────────────
const TOKEN_LENGTH = 6;
const tokenDigits = ref<string[]>(Array(TOKEN_LENGTH).fill(''));
const tokenInputRefs = ref<HTMLInputElement[]>([]);
const enterTokenLoading = ref<boolean>(false);
const tokenError = ref<string | null>(null);

const passwordResetInitialData = { password: '', confirmPassword: '' };
const passwordResetValidation: AnyObjectSchema = Yup.object({
  password: Yup.string().required(),
  confirmPassword: Yup.string()
    .required()
    .oneOf([Yup.ref('password')], t('passwordReset.passwordMismatch')),
});

type TokenValidationStatus = 'idle' | 'validating' | 'valid' | 'invalid';
const tokenValidationStatus = ref<TokenValidationStatus>('idle');

const tokenValue = computed(() => tokenDigits.value.join(''));

const resetEnterTokenState = () => {
  tokenDigits.value = Array(TOKEN_LENGTH).fill('');
  tokenValidationStatus.value = 'idle';
  tokenError.value = null;
};

const validateToken = async () => {
  tokenValidationStatus.value = 'validating';
  const result = await LCApi.resetPasswordByTokenValidateToken(tokenValue.value);
  if (result.type === LCApiResultTypes.success) {
    tokenValidationStatus.value = 'valid';
    tokenError.value = null;
  } else {
    tokenValidationStatus.value = 'invalid';
    tokenError.value = t('passwordReset.invalidToken');
  }
};

const onTokenDigitInput = async (index: number, event: Event) => {
  const input = event.target as HTMLInputElement;
  const val = input.value.replace(/\D/g, '').slice(-1);
  tokenDigits.value[index] = val;
  tokenError.value = null;
  tokenValidationStatus.value = 'idle';

  if (val && index < TOKEN_LENGTH - 1) {
    await nextTick();
    tokenInputRefs.value[index + 1]?.focus();
  }

  if (tokenValue.value.length === TOKEN_LENGTH) {
    await validateToken();
  }
};

const onTokenDigitKeydown = (index: number, event: KeyboardEvent) => {
  if (event.key === 'Backspace' && !tokenDigits.value[index] && index > 0) {
    tokenInputRefs.value[index - 1]?.focus();
  }
};

const onTokenDigitPaste = async (event: ClipboardEvent) => {
  const pasted = event.clipboardData?.getData('text').replace(/\D/g, '').slice(0, TOKEN_LENGTH) ?? '';
  if (!pasted.length) return;
  event.preventDefault();
  for (let i = 0; i < TOKEN_LENGTH; i++) {
    tokenDigits.value[i] = pasted[i] ?? '';
  }
  await nextTick();
  tokenInputRefs.value[Math.min(pasted.length - 1, TOKEN_LENGTH - 1)]?.focus();
  if (pasted.length === TOKEN_LENGTH) {
    await validateToken();
  }
};

const onConfirmReset = async (data: Record<string, any>, setServerErrors: Function) => {
  enterTokenLoading.value = true;
  const result = await LCApi.resetPasswordByTokenConfirm(tokenValue.value, data.password);
  enterTokenLoading.value = false;

  if (result.type === LCApiResultTypes.success) {
    step.value = 'success';
  } else {
    const err = result.error as any;
    if (err?.token) {
      tokenError.value = Array.isArray(err.token) ? err.token.join(' ') : err.token;
    } else {
      setServerErrors(result.error);
    }
  }
};

const resendToken = async () => {
  tokenDigits.value = Array(TOKEN_LENGTH).fill('');
  tokenValidationStatus.value = 'idle';
  tokenError.value = null;
  await LCApi.resetPasswordByToken(resetEmail.value);
};

const goBackFromEnterToken = () => {
  step.value = 'requestToken';
};

const onSuccess = () => {
  emit('success');
};

const onBack = () => {
  emit('back');
};
</script>

<template>
  <div class="password-reset-flow">
    <!-- step: requestToken ────────────────────────────────────────────────── -->
    <div v-if="step === 'requestToken'">
      <div v-if="showBackButton" class="mb-lg">
        <ColorButton size="small" type="success" :text="$t('back')" @click="onBack">
          <template #left><PhCaretLeft :size="16" /></template>
        </ColorButton>
      </div>
      <p class="reset-intro">{{ $t('passwordReset.enterEmailForToken') }}</p>
      <FormWrapper
        :validation="requestTokenValidation"
        :initial-data="requestTokenInitialData"
        @submit="onRequestToken"
      >
        <BasicFormField name="email" :label="$t('user.email')" type="email" :icon="PhEnvelope" />
        <template #actions>
          <AsyncButton :text="$t('passwordReset.sendCode')" :submitting="requestTokenLoading" />
        </template>
      </FormWrapper>
    </div>

    <!-- step: enterToken ──────────────────────────────────────────────────── -->
    <div v-else-if="step === 'enterToken'">
      <div v-if="showBackButton" class="mb-lg">
        <ColorButton size="small" type="success" :text="$t('back')" @click="goBackFromEnterToken">
          <template #left><PhCaretLeft :size="16" /></template>
        </ColorButton>
      </div>

      <template v-if="tokenValidationStatus !== 'valid'">
        <div class="reset-intro" v-if="context === 'migration'">
          <div class="my-2xl">
            <div class="alert alert-info">
              {{ $t('passwordReset.migrationInfo', { appName: appName }) }}
            </div>
          </div>
        </div>
        <div class="reset-intro" v-else>
          {{ $t('passwordReset.tokenSentTo', { email: resetEmail }) }}
        </div>
      </template>
      <div class="reset-intro" v-else>
        {{ $t('passwordReset.enterNewPassword') }}
      </div>

      <div v-if="tokenValidationStatus !== 'valid'">
        <div class="otp-input-group" :class="{ 'otp-invalid': tokenValidationStatus === 'invalid' }">
          <input
            v-for="(digit, i) in tokenDigits"
            :key="i"
            :ref="(el) => { if (el) tokenInputRefs[i] = el as HTMLInputElement }"
            class="otp-box"
            type="text"
            inputmode="numeric"
            maxlength="1"
            autocomplete="one-time-code"
            :value="digit"
            @input="onTokenDigitInput(i, $event)"
            @keydown="onTokenDigitKeydown(i, $event)"
            @paste="onTokenDigitPaste"
          />
        </div>
        <div v-if="tokenValidationStatus === 'validating'" class="otp-status-msg mt-lg">
          {{ $t('passwordReset.validatingToken') }}
        </div>
        <div v-if="tokenError" class="field-error-msg mt-lg">{{ tokenError }}</div>
      </div>

      <!-- phase 2: password fields — shown only after token is valid -->
      <FormWrapper
        v-if="tokenValidationStatus === 'valid'"
        :validation="passwordResetValidation"
        :initial-data="passwordResetInitialData"
        @submit="onConfirmReset"
      >
        <div v-if="tokenError" class="field-error-msg">{{ tokenError }}</div>
        <BasicFormField
          name="password"
          type="password"
          :label="$t('passwordReset.newPassword')"
          :icon="PhPassword"
        />
        <BasicFormField
          name="confirmPassword"
          type="password"
          :label="$t('passwordReset.confirmPassword')"
          :icon="PhPassword"
        />
        <template #actions>
          <AsyncButton
            :text="$t('passwordReset.setNewPassword')"
            :submitting="enterTokenLoading"
          />
        </template>
      </FormWrapper>

      <div class="otp-resend" v-if="context !== 'migration' && tokenValidationStatus !== 'valid'">
        <ColorButton
          :text="$t('passwordReset.resendCode')"
          type="secondary"
          size="medium"
          @click="resendToken"
        />
      </div>
    </div>

    <!-- step: success ─────────────────────────────────────────────────────── -->
    <div v-else-if="step === 'success'">
      <div class="alert alert-success">
        {{ $t('passwordReset.successMessage') }}
      </div>
      <div class="otp-actions">
        <ColorButton :text="$t('done')" size="medium" type="default" @click="onSuccess" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.reset-intro {
  margin-bottom: var(--size-xl);
}

.otp-input-group {
  display: flex;
  gap: 8px;
  justify-content: center;
  margin-bottom: var(--size-m);
}

.otp-input-group input {
  padding: 0;
}

.otp-box {
  width: 44px;
  height: 52px;
  text-align: center;
  font-size: 1.4rem;
  font-weight: 600;
  border: 2px solid var(--color-border, #ccc);
  outline: none;
  transition: border-color 0.15s;
}
.otp-box:focus {
  border-color: var(--color-primary);
}
.otp-valid .otp-box {
  border-color: var(--color-success, #22c55e);
}
.otp-invalid .otp-box {
  border-color: var(--color-danger, #ef4444);
}

.otp-status-msg {
  text-align: center;
  font-size: 0.85rem;
  color: var(--color-muted, #888);
  margin-bottom: var(--size-m);
}

.field-error-msg {
  text-align: center;
  font-size: 0.85rem;
  color: var(--color-danger, #ef4444);
  margin-bottom: var(--size-m);
}

.otp-actions {
  margin-top: var(--size-xl);
}

.otp-resend {
  margin-top: var(--size-2xl);
  text-align: center;
}
</style>
