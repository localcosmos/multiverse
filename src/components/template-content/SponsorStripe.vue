<script setup lang="ts">
import { ref, onMounted, inject } from 'vue';
import type { ImageWithTextAndLicence, LocalCosmosApi } from 'localcosmos-client';
import { LCApiResultTypes } from 'localcosmos-client';
import { useRoute } from 'vue-router';
import { useTemplateContent } from '@/composables/useTemplateContent';
import type { TemplateContentSource } from '@/composables/useTemplateContent';

const isInPreviewMode = inject('isInPreviewMode') as boolean;
const LCApi = inject('LCApi') as LocalCosmosApi;
const route = useRoute();
const { fetchTemplateContent, fetchRemoteTemplateContent, templateContentImageUrl } = useTemplateContent();

const sponsorImages = ref<ImageWithTextAndLicence[]>([]);
const text = ref<string | null>(null);
const templateSource = ref<TemplateContentSource | null>(null);

onMounted(async () => {
  let result;

  if (isInPreviewMode) {
    // slug is provided by the LC server in the route
    const slug = route.params.slug as string;
    result = await fetchTemplateContent(slug);
  } else {
    const slugResponse = await LCApi.getTemplateContentSlugsByAssignment('sponsor-stripe');
    if (slugResponse.type !== LCApiResultTypes.success || !slugResponse.data?.slugs.length) return;
    result = await fetchRemoteTemplateContent(slugResponse.data.slugs[0]);
  }

  if (result?.templateData) {
    const { contents } = result.templateData;
    sponsorImages.value = (contents.sponsorImage as ImageWithTextAndLicence[]) ?? [];
    text.value = (contents.text as string) ?? null;
    templateSource.value = result.source;
  }
});
</script>

<template>
  <div v-if="sponsorImages.length" class="sponsor-stripe">
    <p v-if="text" class="sponsor-stripe__text">{{ text }}</p>
    <div class="sponsor-stripe__logos">
      <img
        v-for="(image, index) in sponsorImages"
        :key="index"
        :src="templateContentImageUrl(image.imageUrl['4x'] ?? image.imageUrl['2x'], templateSource)"
        :alt="image.text ?? ''"
        class="sponsor-logo"
      />
    </div>
  </div>
</template>

<style>
@layer defaults {
  :root {
    --sponsor-stripe-bg: transparent;
    --sponsor-stripe-border-color: transparent;

    --darkmode-sponsor-stripe-bg: transparent;
    --darkmode-sponsor-stripe-border-color: transparent;

    --sponsor-logo-height: clamp(70px, 8vw, 120px);
  }
}

.sponsor-stripe {
  padding: var(--size-2xl);
  background: var(--sponsor-stripe-bg);
  border-top: 1px solid var(--sponsor-stripe-border-color);
  border-bottom: 1px solid var(--sponsor-stripe-border-color);
}

body.dark .sponsor-stripe {
  background: var(--darkmode-sponsor-stripe-bg);
  border-color: var(--darkmode-sponsor-stripe-border-color);
}

.sponsor-stripe__text {
  text-align: center;
  margin-bottom: var(--size-md);
}

.sponsor-stripe__logos {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: var(--size-2xl);
}

.sponsor-logo {
  height: var(--sponsor-logo-height);
  width: auto;
  object-fit: contain;
}
</style>
