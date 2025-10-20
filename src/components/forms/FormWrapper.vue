<script setup lang="ts">
import { ref, computed } from 'vue';
import { useForm } from 'vee-validate';
import type { ServerErrorTypes } from 'localcosmos-client';
import { parseServerErrors, NON_FIELD_ERROR_KEY } from '@/composables/parseServerErrors';
import type { AnyObjectSchema } from 'yup';

const emit = defineEmits(['submit']);

const props = defineProps<{
  validation?: AnyObjectSchema,
  initialData?: Record<string, any>,
  reset?: boolean,
}>();

const formOptions: Record<string, any> = {
  validationSchema: props.validation,
  validateOnMount: false,
};

if (props.initialData) {
  formOptions.initialValues = props.initialData;
}

const { handleSubmit, setErrors, setFieldValue, setValues, resetForm, values, errors } = useForm(formOptions);

const nonFieldErrors = ref<string | string[] | null>(null);
const hasErrors = ref<boolean>(false);

const showUserInputErrorMessage = computed(() => {
  if (Object.keys(errors.value).length) {
    return true;
  }
  return false;
});

const setServerErrors = (serverErrors: ServerErrorTypes) => {
  if (props.validation) {
    const formFields = Object.keys(props.validation.fields);
    const parsedErrors = parseServerErrors(serverErrors, formFields);

    if (parsedErrors != null) {
      hasErrors.value = true;

      if (NON_FIELD_ERROR_KEY in parsedErrors) {
        nonFieldErrors.value = parsedErrors[NON_FIELD_ERROR_KEY];
        delete parsedErrors[NON_FIELD_ERROR_KEY];
      } else {
        nonFieldErrors.value = null;
      }
      setErrors(parsedErrors);
    } else {
      hasErrors.value = false;
      nonFieldErrors.value = null;
    }
  }
};

const onSubmit = handleSubmit((data) => {
  emit('submit', data, setServerErrors);
});
</script>

<template>
  <form @submit.prevent="onSubmit">
    <slot name="default" />
    <div v-if="showUserInputErrorMessage">
      <div  class="alert alert-error w-full mb-2">
        {{ $t('validation.formHasErrors') }}
      </div>
    </div>
    <div v-if="nonFieldErrors !== null">
      <div>
        <div v-if="typeof nonFieldErrors === 'string'" class="alert alert-error w-full">
          <span>{{ nonFieldErrors }}</span>
        </div>
        <div
          v-for="v in nonFieldErrors"
          v-else
          :key="v"
          class="alert alert-error w-full mb-2"
        >
          <span>
            {{ v }}
          </span>
        </div>
      </div>
    </div>
    <div class="form-actions">
      <slot name="actions" />
    </div>
  </form>
</template>

<style scoped>
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1.5rem;
}
</style>