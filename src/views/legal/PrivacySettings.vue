<script setup lang="ts">
import { t } from 'i18next';
import { useCookieConsentStore } from '@/stores/cookie-consent';
import ContentContainer from '@/components/container/ContentContainer.vue';
import OnOffButton from '@/components/ui/OnOffButton.vue';
import CardSection from '@/components/ui/CardSection.vue';

const consentStore = useCookieConsentStore();

</script>

<template>
  <ContentContainer>
    <div class="container page-padding min-h-full">
      <h1>{{ $t('pageTitles.PrivacySettings') }}</h1>
      <div class="my-xl">
        <CardSection>
          <div class="consent-row">
            <div>
              <div class="heading-with-logo">
                <div>
                  <img class="card-heading-logo" src="/images/logos/Vimeo_Logo.svg" />
                </div>
                <div>
                  <h2>{{ $t('privacySettings.vimeoTitle') }}</h2>
                </div>
              </div>
              <p v-html="t('privacySettings.vimeoDescription')"></p>
            </div>
            <div class="consent-button">
              <OnOffButton
                :model-value="consentStore.hasVimeoConsent"
                @update:model-value="consentStore.handleVimeoToggle($event)"
              />
            </div>
          </div>
        </CardSection>
        <CardSection class="mt-xl">
          <div class="consent-row">
            <div>
              <div class="heading-with-logo">
                <div>
                  <img class="card-heading-logo" src="/images/logos/YouTube_Logo_2017.svg" />
                </div>
                <div>
                  <h2>{{ $t('privacySettings.youtubeTitle') }}</h2>
                </div>
              </div>
              <p v-html="t('privacySettings.youtubeDescription')"></p>
            </div>
            <div class="consent-button">
              <OnOffButton
                :model-value="consentStore.hasYoutubeConsent"
                @update:model-value="consentStore.handleYoutubeToggle($event)"
              />
            </div>
          </div>
        </CardSection>
      </div>
    </div>
  </ContentContainer>
</template>

<style scoped>
.consent-row {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  gap: var(--size-md);
}

.heading-with-logo {
  display: flex;
  flex-direction: column;
  gap: var(--size-xl);
}

.card-heading-logo {
  height: 32px;
  width: auto;
  display: block;
}

.heading-with-logo h2 {
  margin: 0;
}

.consent-button {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: var(--size-xl);
}

@media (min-width: 640px) {
  .consent-row {
    flex-direction: row;
  }
}

@media (min-width: 768px) {
}

@media (min-width: 1024px) {

}

@media (min-width: 1280px) {
}

@media (min-width: 1536px) {
}

</style>