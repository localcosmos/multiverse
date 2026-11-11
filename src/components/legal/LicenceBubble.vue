<script setup lang="ts">
import { ref, onMounted, onUpdated, inject } from 'vue';
import type { ImageLicence, LicenceRegistry } from 'localcosmos-client';
import LoadingSpinner from '@/components//ui/LoadingSpinner.vue';

const props = defineProps<{
  licence?: ImageLicence,
  imageUrl?: string,
  x: number,
  y: number
}>();

const bubble = ref<HTMLElement>();
const licenceRegistry = inject('licenceRegistry') as LicenceRegistry;
const isInPreviewMode = inject<boolean>('isInPreviewMode', false);
const loading = ref<boolean>(false);
const loadedRegistry = ref<boolean>(false);

const imageLicence = ref<ImageLicence | null>(null);
const imageLicenceLink = ref<string | null>(null);

const openExternalLink = (link: string) => {
  // window.open does not work in iOS
    // window.open(link);
    let target = '_blank';
    // @ts-ignore
    if (device.platform === 'browser' || device.platform === 'Android') {
      target = '_system';
    }
    // @ts-ignore
    cordova.InAppBrowser.open(link, target);
};

const goToLicence = (event: Event) => {
  event.preventDefault();
  event.stopPropagation();
  if (imageLicenceLink.value) {
    const link = imageLicenceLink.value;
    openExternalLink(link);
  }
}

const goToSourceImage = (event: Event) => {
  event.preventDefault();
  event.stopPropagation();
  if (imageLicence.value) {
    const link = imageLicence.value.sourceLink;
    openExternalLink(link);
  }
}

const updateLicenceLink = () => {

  let link = null;

  if (imageLicence.value) {
    const licence = imageLicence.value.licence;
    const version = imageLicence.value.licenceVersion;

    if (licence.indexOf('CC') == 0) {
      if (licence == 'CC0') {
        link = 'https://creativecommons.org/public-domain/cc0/';
      } else {
        const licenceType = licence.substring(3, licence.length);
        link = `https://creativecommons.org/licenses/${licenceType.toLowerCase()}/${version.toLowerCase()}/legalcode.de`;
      }
    }
  }
  imageLicenceLink.value = link;
};

const positionBubble = () => {
  if (bubble.value) {
    const leftX = props.x;
    if (leftX + 250 > screen.width) {
      bubble.value.style.right = '10px';
    } else {
      bubble.value.style.left = props.x + 'px';
    }
    bubble.value.style.top = props.y - bubble.value.clientHeight - 0 + 'px';
  }
}

const updateImageLicence = async () => {
  if (isInPreviewMode) {
    loading.value = false;
    imageLicence.value = null;
    imageLicenceLink.value = null;
    return;
  }

  if (props.imageUrl) {
    if (loadedRegistry.value === false) {
      loading.value = true;
      await licenceRegistry.loadRegistry();
      loadedRegistry.value = true;
    }
    imageLicence.value = licenceRegistry.getLicence(props.imageUrl) ?? props.licence ?? null;
  } else if (props.licence) {
    imageLicence.value = props.licence;
  }

  updateLicenceLink();

  loading.value = false;
};

onMounted(async () => {
  positionBubble();
  await updateImageLicence();
});

onUpdated(async () => {
  positionBubble();
  await updateImageLicence();
});

</script>

<template>
  <div
    ref="bubble"
    id="licenceBubble"
  >
    <div v-if="isInPreviewMode">
      licences not avialable in preview mode
    </div>
    <div
      v-else-if="loading"
      class="loading-licences"
    >
      <div>
        <LoadingSpinner />
      </div>
      <div>
        {{ $t('legal.loadingLicences') }}
      </div>

    </div>
    <div v-else>
      <div class="licence-title">
        {{ $t('legal.imageBy') }}:
      </div>
      <div v-if="imageLicence">
        <strong>{{ imageLicence.creatorName }}</strong> <br>
        <div
          v-if="imageLicenceLink"
          class="image-licence-link cursor-pointer"
          @pointerdown="goToLicence"
        >
          {{ imageLicence.licence }}
          <span v-if="imageLicence.licenceVersion">
            {{ imageLicence.licenceVersion }}
          </span>
        </div>
        <div v-else>
          {{ imageLicence.licence }}
          <span v-if="imageLicence.licenceVersion">
            {{ imageLicence.licenceVersion }}
          </span>
        </div>
        <div
          v-if="imageLicence.sourceLink"
          class="image-licence-link cursor-pointer"
          @pointerdown="goToSourceImage"
        >
          {{ $t('legal.linkToSourceImage') }}
        </div>
      </div>
      <div v-else>
        {{ $t('legal.noLicenceFound') }}
      </div>
    </div>
  </div>
</template>

<style>
@layer defaults {
  :root {
    --licence-bubble-bg: rgba(255, 255, 255, 1);
    --licence-bubble-link-color: var(--color-primary);
    --darkmode-licence-bubble-bg: rgba(0, 0, 0, 1);
    --darkmode-licence-bubble-link-color: var(--color-primary);
  }
}

#licenceBubble {
  position: fixed;
  width: 250px;
  z-index: 101;
  transition: opacity 0.5s ease;
  padding: var(--size-md);
  border-radius: var(--border-radius-sm);
  box-shadow: var(--box-shadow);
  background: var(--licence-bubble-bg);
}

body.dark #licenceBubble {
  background: var(--darkmode-licence-bubble-bg);
}

#licenceBubble.loading-licences {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 2px;
}

#licenceBubble .image-licence-link {
  color: var(--licence-bubble-link-color);
}

body.dark #licenceBubble .image-licence-link {
  color: var(--darkmode-licence-bubble-link-color);
}

#licenceBubble .licence-title {
  font-size: var(--font-size-md);
  color: rgb(150,150,150);
}
</style>
