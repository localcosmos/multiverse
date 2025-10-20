<script setup lang="ts">
import { computed } from 'vue';
import type { LocalcosmosPublicUser } from 'localcosmos-client';
import { t } from 'i18next';

const props = defineProps<{
  user: LocalcosmosPublicUser | null
}>();

const profilePicture = computed(() => {
  if (props.user && props.user.profilePicture && props.user.profilePicture.imageUrl) {
    return props.user.profilePicture.imageUrl['2x'];
  } else {
    return '/images/no-profile-picture.svg';
  }
});

const displayName = computed(() => {
  if (props.user != null) {
    if (props.user.firstName && props.user.firstName.length && props.user.lastName && props.user.lastName.length) {
      return `${props.user.firstName} ${props.user.lastName}`;
    } else {
      return props.user.username;
    }
  } else {
    return t('userCard.anonymousUser');
  }
});
</script>

<template>
  <div v-if="props.user !== null" class="nolinkstyle">
    <RouterLink :to="{ name: 'user-profile', params: { uuid: props.user.uuid } }">
      <div class="user-card box-shadow">
        <div class="profile-picture">
          <img :src="profilePicture">
        </div>
        <div class="user-content">
          <div class="username">
            {{ displayName }}

          </div>
        </div>
      </div>
    </RouterLink>
  </div>
  <div v-else>
    {{ displayName }}
  </div>
</template>

<style scoped>
.user-card {
  border-radius: var(--border-radius-sm);
  padding: var(--size-sm);
  display: grid;
  grid-template-columns: 80px auto;
  gap: var(--gap-medium);
  background: #FFF;
  width: 300px;
  box-shadow: var(--box-shadow);
  cursor: pointer;
}

.profile-picture {
  width: 80px;
  height: 80px;
  padding: var(--paddng-medium);
}

.profile-picture img {
  width: 100%;
  aspect-ratio: 1 / 1;
}

.username {
  font-weight: 600;
}

.user-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
}
</style>
