<script setup lang="ts">
import { ref, inject } from 'vue';
import type { LocalCosmosApi } from 'localcosmos-client';
import { LCApiResultTypes } from 'localcosmos-client';
import ContentContainer from '@/components/container/ContentContainer.vue';
import AsyncButton from '@/components/ui/AsyncButton.vue';
import * as Yup from 'yup';
import { PhEnvelope } from '@phosphor-icons/vue';
import type { AnyObjectSchema } from 'yup';

import FormWrapper from '@/components/forms/FormWrapper.vue';
import BasicFormField from '@/components/forms/fields/BasicFormField.vue';

const LCApi = inject('LCApi') as LocalCosmosApi;

const validation: AnyObjectSchema = Yup.object({
  email: Yup.string().required().email(),
});

const resetPassword = ref<Record<string, string>>({
    email: '',
});

const resetPasswordEmailSent = ref<boolean>(false);

const submitting = ref<boolean>(false);

const onSubmit = async (data:any, setServerErrors: Function) => {

  const email: string = resetPassword.value.email;

  submitting.value = true;
  const result = await LCApi.resetPasswordEmail(email);
  submitting.value = false;

  if (result.type === LCApiResultTypes.success) {
    resetPasswordEmailSent.value = true;
  }
  else {
    setServerErrors(result.error);
  }
};
</script>

<template>
  <ContentContainer>
    <div class="page page-padding">
      <div class="container-small">
        <div>
          <h1 class="h1">
            {{ $t('passwordReset.title') }}
          </h1>
          <p class="my-xl">
            {{ $t('passwordReset.intro') }}
          </p>
        </div>
        <div class="my-xl">
          <div v-if="resetPasswordEmailSent">
            <div class="alert alert-success">
              {{ $t('passwordReset.emailSent') }}
            </div>
          </div>
          <div v-else>
            <FormWrapper
              :validation="validation"
              @submit="onSubmit"
            >
              <BasicFormField
                v-model="resetPassword.email"
                name="email"
                :label="$t('user.email')"
                type="email"
                :icon="PhEnvelope"
              >
              </BasicFormField>
              <template #actions>
                <AsyncButton :submitting="submitting" :text="$t('send')">
                </AsyncButton>
              </template>
            </FormWrapper>
          </div>
        </div>
      </div>
    </div>
  </ContentContainer>
</template>

