<script setup lang="ts">
import { ref, onBeforeMount } from 'vue';
import ContentContainer from '@/components/container/ContentContainer.vue';
import ColorButton from '@/components/ui/ColorButton.vue';
import { useAuthStore } from '@/stores/auth';
import * as Yup from 'yup';
import type { AnyObjectSchema } from 'yup';
import FormWrapper from '@/components/forms/FormWrapper.vue';
import BasicFormField from '@/components/forms/fields/BasicFormField.vue';
import AsyncButton from '@/components/ui/AsyncButton.vue';
import { t } from 'i18next';
import { PhIdentificationCard, PhEnvelope } from '@phosphor-icons/vue';
import ProfileDeleteModal from '@/components/modals/ProfileDeleteModal.vue';
import ProfilePictureModal from '@/components/modals/ProfilePictureModal.vue';
import ProfilePictureDeleteModal from '@/components/modals/ProfilePictureDeleteModal.vue';
import fallBackProfilePicture from '@/assets/images/no-image.svg';

const authStore = useAuthStore();

const account = ref<Record<string,string>>({
  email: '',
  // username: '',
  firstName: '',
  lastName: '',
});

const validation: AnyObjectSchema = Yup.object({
  // username: Yup.string().required().min(4),
  email: Yup.string().required().email(),
  firstName: Yup.string(),
  lastName: Yup.string(),
});

const loading = ref<boolean>(false);
const editSuccess = ref<boolean>(false);

let profilePictureUrl = fallBackProfilePicture;
if (authStore.user?.profilePicture) {
  profilePictureUrl = authStore.user.profilePicture.imageUrl['2x'];
}

const profilePicture = ref(profilePictureUrl);

const onSubmit = async () => {
  if (loading.value) {
    return;
  }

  loading.value = true;
  await authStore.updateUser(account.value);
  loading.value = false;
  editSuccess.value = true;
  setTimeout(() => {
    editSuccess.value = false;
  }, 3000);
};

const reloadPicture = async () => {
  await authStore.reloadUserData();
  if (authStore.user?.profilePicture) {
    profilePicture.value = authStore.user.profilePicture.imageUrl['2x'];
  } else {
    profilePicture.value = fallBackProfilePicture;
  }
};

onBeforeMount(async() => {
  await authStore.loadUser();
  if (authStore.user) {
    // account.value.username = authStore.user.username;
    account.value.email = authStore.user.email;
    if (authStore.user.firstName) {
      account.value.firstName = authStore.user.firstName;
    }
    if (authStore.user.lastName) {
      account.value.lastName = authStore.user.lastName;
    }
  }
});
</script>

<template>
  <ContentContainer>
    <div class="page page-padding">
      <div class="container">
        <div v-if="authStore.user">
          <div class="user-user">
            <div class="user-picture">
              <img :src="profilePicture" alt="User Picture" />
            </div>
            <div class="user-username">
              {{ authStore.user.username }}
            </div>
            <div class="flex flex-gap-xl">
              <div>
                <ProfilePictureModal @updated="reloadPicture" />
              </div>
              <div>
                <ProfilePictureDeleteModal v-if="authStore.user.profilePicture" @updated="reloadPicture" />
              </div>
            </div>
          </div>
          <div>
            <div class="edit-account-details">
              <div class="w-full my-xl">
                <h2>{{ $t('MyAccount.accountDetails') }}</h2>
              </div>
              <div class="edit-account-form">
                <FormWrapper :validation="validation" @submit="onSubmit">
                  <!--<BasicFormField
                    v-model="account.username"
                    name="username"
                    label="Benutzername"
                    type="text"
                    icon="Person"
                  /> -->
                  <BasicFormField
                    v-model="account.email"
                    name="email"
                    label="Email"
                    type="email"
                    :icon="PhEnvelope"
                  />
                  <BasicFormField
                    v-model="account.firstName"
                    name="firstName"
                    label="Vorname"
                    type="text"
                    :icon="PhIdentificationCard"
                  />
                  <BasicFormField
                    v-model="account.lastName"
                    name="lastName"
                    label="Nachname"
                    type="text"
                    :icon="PhIdentificationCard"
                  />
                  <template #actions>
                    <AsyncButton :text="t('save')" :submitting="loading">
                    </AsyncButton>
                  </template>
                </FormWrapper>
              </div>
              <div v-if="editSuccess" class="alert alert-success w-full mt-xl">
                {{ $t('MyAccount.editSuccess') }}
              </div>
            </div>
          </div>
          <div class="container-small mt-xxl">
            <div class="mt-xl">
              <h2>{{ $t('logout') }}</h2>
            </div>
            <div class="flex">
              <ColorButton
                @click="authStore.logout"
                :text="$t('logout')"
                class="cursor-pointer"
              >
              </ColorButton>
            </div>
            <div class="mt-xl">
              <h2>{{ $t('MyAccount.changePasswordTitle') }}</h2>
            </div>
            <div class="flex">
              <RouterLink :to="{ name: 'password-reset' }" class="nolinkstyle">
                <ColorButton :text="$t('MyAccount.changePassword')" />
              </RouterLink>
            </div>
            <div class="mt-xl">
              <h2>{{ $t('MyAccount.deleteAccountTitle') }}</h2>
            </div>
            <div class="flex">
              <ProfileDeleteModal />
            </div>
          </div>
        </div>
        <div v-else>
          <p>{{ $t('account.notLoggedIn') }}</p>
        </div>
      </div>
    </div>
  </ContentContainer>
</template>

<style scoped>
.user-user {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--size-md);
  gap: var(--size-md);
}

.user-picture {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  overflow: hidden;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-picture img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.user-username {
  margin-top: 0.5rem;
  font-size: 1.5rem;
  font-weight: 700;
  text-align: center;
  color: #222;
  letter-spacing: 0.01em;
  word-break: break-all;
}

.edit-account-details {
  width: 100%;
  display: block;
  margin: 0 auto;
}

.edit-account-form {
  display: flex;
  justify-content: center;
  width: 100%;
}

.edit-account-form form,
.edit-account-form .form-wrapper {
  width: 100%;
  max-width: 400px;
}

/* --- Responsive --- */
@media (min-width: 640px) {
  .user-username {
    font-size: 2rem;
  }
  .edit-account-details {
    max-width: 480px;
  }
  .edit-account-form form,
  .edit-account-form .form-wrapper {
    max-width: 480px;
  }
  .user-picture {
    width: 96px;
    height: 96px;
  }
}

@media (min-width: 1024px) {
  .user-username {
    font-size: 2.5rem;
  }
  .edit-account-details {
    max-width: 540px;
  }
  .edit-account-form form,
  .edit-account-form .form-wrapper {
    max-width: 540px;
  }
  .user-picture {
    width: 128px;
    height: 128px;
  }
}
</style>