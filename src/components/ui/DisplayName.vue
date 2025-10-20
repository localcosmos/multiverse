<script setup lang="ts">
import type { LocalcosmosPublicUser } from 'localcosmos-client';

defineProps<{
  user: LocalcosmosPublicUser | null
}>();
</script>

<template>
  <span v-if="user === null">
    {{ $t('userCard.anonymousUser') }}
  </span>
  <span v-else>
    <span v-if="user.firstName && user.lastName">
      {{ user.firstName }} {{ user.lastName }}
    </span>
    <span v-else>
      {{ user.username }}
    </span>
  </span>
</template>
