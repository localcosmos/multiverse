<script setup lang="ts">
import { ref, inject, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import type { LocalCosmosApi, LocalcosmosPublicUser } from 'localcosmos-client';
import { LCApiResultTypes } from 'localcosmos-client';
import OnlinePage from '@/components/container/OnlinePage.vue';
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue';

const LCApi = inject('LCApi') as LocalCosmosApi;

const route = useRoute();
const userUuid = route.params.uuid as string;

const user = ref<LocalcosmosPublicUser | null>(null);
const loading = ref<boolean>(true);

const dateJoined = ref<string>('');
const pictureUrl = ref<string>('/images/no-profile-picture.svg');

onMounted(async () => {
  const result = await LCApi.getUserProfile(userUuid);

  if (result.type === LCApiResultTypes.success) {
    const data = result.data as LocalcosmosPublicUser;
    user.value = data;
    if (data.profilePicture) {
      pictureUrl.value = data.profilePicture.imageUrl['1x'];
    }

    const joined = new Date(data.dateJoined).toLocaleString().split(',')[0];
    dateJoined.value=joined;
  }

  loading.value = false;
});
</script>

<template>
  <OnlinePage>
    <div class="page page-padding">
      <div class="container-small">
        <div v-if="loading" class="loading-spinner">
          <LoadingSpinner />
        </div>
        <div v-else>
          <div
            v-if="user"
            class="profile"
          >
            <div>
              <div
                class="profile-picture"
                :style="`background-image:url(${pictureUrl})`"
              >
              </div>
            </div>
            <div>
              <div class="full-name">
                {{ user.firstName }} {{ user.lastName }}
              </div>
              <div class="username">
                <i>{{ user.username }}</i>
              </div>
              <div>
                dabei seit: {{ dateJoined }}
              </div>
              <div>
                Anzahl Meldungen: {{ user.datasetCount }}
              </div>
              <!--
              <div>
                <RouterLink :to="{ name: 'contact-user', params: { uuid: user.uuid } }">
                    Nutzer kontaktieren
                </RouterLink>
              </div>
            -->
            </div>
          </div>
          <div v-else>
            Nutzer nicht gefunden
          </div>
        </div>
      </div>
    </div>
  </OnlinePage>
</template>

<style scoped>
.full-name {
  font-size: 1.4rem;
  font-weight: bold;
}

.username {
  font-size: 1.3rem;
}

.profile {
  display: flex;
  flex-direction: row;
  gap: 12px;
  justify-content: flex-start;
  align-items: center;
}

.profile-picture {
  width: 150px;
  aspect-ratio: 1/1;
  border-radius: 50%;
  background-position: center center;
  background-size: cover;
  background-repeat: no-repeat;
}

.loading-spinner {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}
</style>