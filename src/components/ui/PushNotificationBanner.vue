<script setup lang="ts">
import { usePushNotificationsStore } from '@/stores/push-notifications';

const pushNotifications = usePushNotificationsStore();
</script>

<template>
  <Transition name="push-banner">
    <div
      v-if="pushNotifications.foregroundNotification"
      class="push-notification-banner"
      role="alert"
      @click="pushNotifications.dismissForegroundNotification()"
    >
      <div v-if="pushNotifications.foregroundNotification.title" class="push-notification-title">
        {{ pushNotifications.foregroundNotification.title }}
      </div>
      <div v-if="pushNotifications.foregroundNotification.body" class="push-notification-body">
        {{ pushNotifications.foregroundNotification.body }}
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.push-notification-banner {
  position: fixed;
  top: env(safe-area-inset-top, 0);
  left: 50%;
  transform: translateX(-50%);
  max-width: 480px;
  width: calc(100% - 2rem);
  background: var(--color-surface, #fff);
  color: var(--color-on-surface, #000);
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.18);
  padding: var(--size-xl);
  z-index: 9999;
  cursor: pointer;
}

.push-notification-title {
  font-weight: 600;
  font-size: 0.95rem;
  margin-bottom: 0.2rem;
}

.push-notification-body {
  font-size: 0.875rem;
  opacity: 0.85;
}

.push-banner-enter-active,
.push-banner-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.push-banner-enter-from,
.push-banner-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-12px);
}
</style>
