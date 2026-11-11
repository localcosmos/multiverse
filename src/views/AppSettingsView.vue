<script setup lang="ts">
import GradientContainer from '@/components/container/GradientContainer.vue';
import OnOffButton from '@/components/ui/OnOffButton.vue';
import { PhCaretRight } from '@phosphor-icons/vue';
import { usePushNotificationsStore } from '@/stores/push-notifications';
import { useAppSettingsStore } from '@/stores/app-settings';

const pushStore = usePushNotificationsStore();
const appSettings = useAppSettingsStore();

// @ts-ignore
const isBrowser = (typeof device === 'undefined') || device.platform === 'browser';

const onPushToggle = async (value: boolean) => {
  if (value) {
    await pushStore.enable();
  } else {
    await pushStore.disable();
  }
};
</script>

<template>
  <GradientContainer>
    <div class="container min-h-100">
      <div class="page-padding-x desktop-header-padding-top">
        <div class="pt-2xl">
          <h1>{{ $t('pageTitles.AppSettings') }}</h1>
        </div>
      </div>

      <div class="settings-section mt-2xl">
        <div class="settings-section-label font-size-md">
          {{ $t('appSettings.sectionAppearance') }}
        </div>

        <div class="settings-item">
          <div class="settings-item-text">
            <span class="settings-item-title">{{ $t('appSettings.darkModeTitle') }}</span>
            <span class="settings-item-description font-size-md">{{ $t('appSettings.darkModeDescription') }}</span>
          </div>
          <div class="settings-item-control">
            <OnOffButton
              :model-value="appSettings.isDark"
              @update:model-value="appSettings.setColorScheme($event ? 'dark' : 'light')"
            />
          </div>
        </div>
      </div>

      <div class="settings-section mt-2xl">
        <div class="settings-section-label font-size-md">
          {{ $t('appSettings.sectionExhibitionMode') }}
        </div>

        <RouterLink :to="{ name: 'exhibition-mode-settings' }" class="settings-item settings-item--link">
          <div class="settings-item-text">
            <span class="settings-item-title">{{ $t('appSettings.exhibitionModeTitle') }}</span>
            <span class="settings-item-description font-size-md">{{ $t('appSettings.exhibitionModeDescription') }}</span>
          </div>
          <div class="settings-item-control">
            <PhCaretRight :size="20" />
          </div>
        </RouterLink>
      </div>

      <div class="settings-section mt-2xl">
        <div class="settings-section-label font-size-md">
          {{ $t('appSettings.sectionNotifications') }}
        </div>

        <div class="settings-item" :class="{ 'settings-item--disabled': isBrowser }">
          <div class="settings-item-text">
            <span class="settings-item-title">{{ $t('appSettings.pushNotificationsTitle') }}</span>
            <span class="settings-item-description font-size-md">{{ $t('appSettings.pushNotificationsDescription') }}</span>
            <span v-if="isBrowser" class="settings-item-unavailable font-size-md">
              {{ $t('appSettings.pushNotificationsUnavailableOnBrowser') }}
            </span>
            <span v-if="pushStore.error" class="settings-item-error">{{ pushStore.error }}</span>
          </div>
          <div v-if="!isBrowser" class="settings-item-control">
            <OnOffButton
              :model-value="pushStore.pushOptedIn"
              :disabled="pushStore.isRegistering"
              @update:model-value="onPushToggle($event)"
            />
          </div>
        </div>
      </div>
    </div>
  </GradientContainer>
</template>

<style>
.settings-item-unavailable {
  line-height: 1.4;
  font-style: italic;
  color: var(--color-accent-1);
}

.settings-section-label {
  padding: var(--size-sm) var(--size-xl) var(--size-xs);
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  opacity: 0.6;
}

.settings-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: var(--size-lg);
  padding: var(--size-md) var(--size-xl);
  min-height: 72px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.settings-item-text {
  display: flex;
  flex-direction: column;
  gap: var(--size-xs);
  flex: 1;
  min-width: 0;
}

.settings-item-title {
  font-weight: 500;
  line-height: 1.3;
  opacity: 1;
}

.settings-item--link {
  text-decoration: none;
  color: inherit;
  cursor: pointer;
}

.settings-item-description {
  opacity: 0.8;
  line-height: 1.4;
}

.settings-item-hint {

  opacity: 0.7;
  line-height: 1.4;
  font-style: italic;
}

.settings-item-error {
  color: var(--color-error);
  line-height: 1.4;
}

.settings-item-control {
  flex-shrink: 0;
}
</style>
