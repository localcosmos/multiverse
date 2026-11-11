<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { VueFinalModal } from 'vue-final-modal';
import { t } from 'i18next';
import { PhBackspace, PhX } from '@phosphor-icons/vue';

const props = defineProps<{
  modelValue: boolean;
  mode: 'activate' | 'deactivate';
  error?: string | null;
  submitting?: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'confirm', pin: string): void;
}>();

// step 1 = enter pin, step 2 = confirm pin (activate only)
const step = ref<1 | 2>(1);
const pin = ref('');
const firstPin = ref('');
const mismatch = ref(false);

const isOpen = computed({
  get: () => props.modelValue,
  set: (v: boolean) => emit('update:modelValue', v),
});

watch(isOpen, (open) => {
  if (open) reset();
});

function reset() {
  step.value = 1;
  pin.value = '';
  firstPin.value = '';
  mismatch.value = false;
}

function close() {
  isOpen.value = false;
}

function pressDigit(digit: string) {
  if (pin.value.length < 20) {
    pin.value += digit;
    mismatch.value = false;
  }
}

function backspace() {
  pin.value = pin.value.slice(0, -1);
  mismatch.value = false;
}

const canProceed = computed(() => pin.value.length >= 4);

function handleSubmit() {
  if (!canProceed.value) return;

  if (props.mode === 'deactivate') {
    emit('confirm', pin.value);
    return;
  }

  // activate: two-step
  if (step.value === 1) {
    firstPin.value = pin.value;
    pin.value = '';
    step.value = 2;
    return;
  }

  if (pin.value !== firstPin.value) {
    mismatch.value = true;
    pin.value = '';
    return;
  }

  emit('confirm', pin.value);
}

const title = computed(() =>
  props.mode === 'activate'
    ? t('exhibitionMode.pinModalTitleActivate')
    : t('exhibitionMode.pinModalTitleDeactivate'),
);

const stepLabel = computed(() => {
  if (props.mode === 'deactivate') return t('exhibitionMode.pinEnterPin');
  return step.value === 1
    ? t('exhibitionMode.pinEnterPin')
    : t('exhibitionMode.pinConfirmPin');
});

const actionLabel = computed(() =>
  props.mode === 'activate'
    ? t('exhibitionMode.enableButton')
    : t('exhibitionMode.disableButton'),
);

const digits = computed(() => '●'.repeat(pin.value.length));

const KEYPAD_ROWS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['0'],
];
</script>

<template>
  <VueFinalModal
    v-model="isOpen"
    overlay-transition="vfm-fade"
    content-transition="vfm-fade"
    class="vfm-centered"
  >
    <div class="pin-modal-box">
      <button class="pin-modal-close" @click="close" :aria-label="$t('close')">
        <PhX :size="24" />
      </button>

      <div class="pin-modal-title">{{ title }}</div>

      <!-- step indicator for activate -->
      <div v-if="mode === 'activate'" class="pin-step-indicator">
        <span :class="['pin-step-dot', { active: step === 1, done: step === 2 }]" />
        <span :class="['pin-step-dot', { active: step === 2 }]" />
      </div>

      <div class="pin-step-label font-size-md">{{ stepLabel }}</div>

      <!-- PIN display -->
      <div class="pin-display" aria-live="polite">
        <span v-if="digits" class="pin-dots">{{ digits }}</span>
        <span v-else class="pin-placeholder">— — — —</span>
      </div>

      <!-- error messages -->
      <div v-if="mismatch" class="pin-error font-size-md">
        {{ $t('exhibitionMode.errorPasswordMismatch') }}
      </div>
      <div v-else-if="error" class="pin-error font-size-md">
        {{ error }}
      </div>

      <!-- keypad -->
      <div class="pin-keypad">
        <div v-for="(row, ri) in KEYPAD_ROWS" :key="ri" class="pin-keypad-row">
          <button
            v-for="digit in row"
            :key="digit"
            class="pin-key"
            @click="pressDigit(digit)"
          >
            {{ digit }}
          </button>
        </div>
        <div class="pin-keypad-row pin-keypad-row--actions">
          <button class="pin-key pin-key--backspace" @click="backspace" :aria-label="$t('delete')">
            <PhBackspace :size="22" />
          </button>
          <button
            class="pin-key pin-key--confirm"
            :disabled="!canProceed || submitting"
            @click="handleSubmit"
          >
            <template v-if="mode === 'activate' && step === 1">
              {{ $t('exhibitionMode.pinNext') }}
            </template>
            <template v-else>
              {{ actionLabel }}
            </template>
          </button>
        </div>
      </div>
    </div>
  </VueFinalModal>
</template>

<style>
@layer defaults {
  :root {
    --pin-modal-bg: #fff;
    --pin-modal-title-color: #222;
    --pin-modal-close-color: #888;
    --pin-modal-close-hover-color: #222;
    --pin-step-dot-bg: #ccc;
    --pin-step-label-color: #555;
    --pin-dots-color: #111;
    --pin-placeholder-color: #bbb;
    --pin-key-bg: #f9fafb;
    --pin-key-active-bg: #e5e7eb;
    --pin-key-border: #d1d5db;
    --pin-key-color: #111;
    --pin-key-backspace-color: #555;

    --darkmode-pin-modal-bg: #1e1e2e;
    --darkmode-pin-modal-title-color: #f0f0f0;
    --darkmode-pin-modal-close-color: #aaa;
    --darkmode-pin-modal-close-hover-color: #fff;
    --darkmode-pin-step-dot-bg: #444;
    --darkmode-pin-step-label-color: #aaa;
    --darkmode-pin-dots-color: #f0f0f0;
    --darkmode-pin-placeholder-color: #555;
    --darkmode-pin-key-bg: #2a2a3a;
    --darkmode-pin-key-active-bg: #3a3a4a;
    --darkmode-pin-key-border: #444;
    --darkmode-pin-key-color: #f0f0f0;
    --darkmode-pin-key-backspace-color: #aaa;

    --pin-confirm-bg: var(--color-primary, #2563eb);
    --pin-confirm-color: #fff;
    --pin-confirm-hover-bg: var(--color-primary-dark, #1d4ed8);

    --darkmode-pin-confirm-bg: var(--color-primary, #2563eb);
    --darkmode-pin-confirm-color: #fff;
    --darkmode-pin-confirm-hover-bg: var(--color-primary-dark, #1d4ed8);
  }
}

.pin-modal-box {
  background: var(--pin-modal-bg);
  border-radius: var(--border-radius, 12px);
  padding: var(--size-xl, 1.5rem) var(--size-xl, 1.5rem) var(--size-lg, 1.25rem);
  width: min(92vw, 360px);
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  margin: auto;
}

body.dark .pin-modal-box {
  background: var(--darkmode-pin-modal-bg);
}

.pin-modal-close {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--pin-modal-close-color);
  padding: 8px;
  display: flex;
  align-items: center;
}
.pin-modal-close:hover { color: var(--pin-modal-close-hover-color); }

body.dark .pin-modal-close { color: var(--darkmode-pin-modal-close-color); }
body.dark .pin-modal-close:hover { color: var(--darkmode-pin-modal-close-hover-color); }

.pin-modal-title {
  font-size: 1.2rem;
  font-family: var(--font-family-h1, inherit);
  font-weight: 700;
  text-align: center;
  color: var(--pin-modal-title-color);
  margin-top: var(--size-lg);
}

body.dark .pin-modal-title { color: var(--darkmode-pin-modal-title-color); }

.pin-step-indicator {
  display: flex;
  gap: 0.5rem;
}
.pin-step-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--pin-step-dot-bg);
  transition: background 0.2s;
}
.pin-step-dot.active { background: var(--color-primary, #2563eb); }
.pin-step-dot.done   { background: #22c55e; }

body.dark .pin-step-dot { background: var(--darkmode-pin-step-dot-bg); }

.pin-step-label {
  color: var(--pin-step-label-color);
  text-align: center;
}

body.dark .pin-step-label { color: var(--darkmode-pin-step-label-color); }

.pin-display {
  min-height: 2.5rem;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  letter-spacing: 0.35em;
  font-size: 1.6rem;
  overflow: hidden;
}
.pin-dots {
  color: var(--pin-dots-color);
  word-break: break-all;
  white-space: normal;
  text-align: center;
  line-height: 1.4;
}
.pin-placeholder { color: var(--pin-placeholder-color); font-size: 1.2rem; }

body.dark .pin-dots { color: var(--darkmode-pin-dots-color); }
body.dark .pin-placeholder { color: var(--darkmode-pin-placeholder-color); }

.pin-error {
  color: var(--color-error, #dc2626);
  text-align: center;
  min-height: 1.2em;
}

.pin-keypad {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
  margin-top: 0.25rem;
}

.pin-keypad-row {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
}

.pin-key {
  width: 72px;
  height: 56px;
  border: 1.5px solid var(--pin-key-border);
  border-radius: 10px;
  background: var(--pin-key-bg);
  color: var(--pin-key-color);
  font-size: 1.4rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.12s, transform 0.08s;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}
.pin-key:active {
  background: var(--pin-key-active-bg);
  transform: scale(0.94);
}

body.dark .pin-key {
  background: var(--darkmode-pin-key-bg);
  border-color: var(--darkmode-pin-key-border);
  color: var(--darkmode-pin-key-color);
}
body.dark .pin-key:active { background: var(--darkmode-pin-key-active-bg); }

.pin-key--backspace {
  color: var(--pin-key-backspace-color);
  font-size: 1rem;
  width: 72px;
}

body.dark .pin-key--backspace { color: var(--darkmode-pin-key-backspace-color); }

.pin-keypad-row--actions {
  margin-top: 0.25rem;
  gap: 0.75rem;
}

.pin-key--confirm {
  flex: 1;
  max-width: 200px;
  height: 52px;
  background: var(--pin-confirm-bg);
  color: var(--pin-confirm-color);
  border-color: transparent;
  font-size: 0.95rem;
  border-radius: 10px;
}
body.dark .pin-key--confirm {
  background: var(--darkmode-pin-confirm-bg);
  color: var(--darkmode-pin-confirm-color);
}
.pin-key--confirm:hover:not(:disabled) {
  background: var(--pin-confirm-hover-bg);
}
body.dark .pin-key--confirm:hover:not(:disabled) {
  background: var(--darkmode-pin-confirm-hover-bg);
}
.pin-key--confirm:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>
