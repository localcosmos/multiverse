<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';
import type { ImageWithTextAndLicence } from 'localcosmos-client';
import { imageUrlsToSrcSet } from '@/composables/imageUrlsToSrcSet';
import { templateContentImageUrlsToSrcSet } from '@/composables/templateContentImageUrlsToSrcSet';
import LicenceCircle from '@/components/legal/LicenceCircle.vue';

import type { GestureEvent } from 'contactjs';
import { PointerListener, Pinch, Pan } from 'contactjs';

const props = withDefaults(defineProps<{
  image: ImageWithTextAndLicence,
  sizes?: string,
  rounded?: string,
  title?: string,
  altText?: string,
  showCaption?: boolean,
  isTemplateContentImage?: boolean, // If true, use different styling for template content images
}>(), {
  showCaption: true,
  isTemplateContentImage: false,
});

const emit = defineEmits(['zoomed']); // Define the "zoomed" event

const hasCaption: boolean = !!(props.showCaption && props.image.text);

const srcSetFn = props.isTemplateContentImage ? templateContentImageUrlsToSrcSet : imageUrlsToSrcSet;

const sharpLicenceCircle = !props.rounded || (hasCaption && (
  props.rounded === 'rounded' ||
  props.rounded === 'rounded-xs' ||
  props.rounded === 'rounded-sm'
));

const maxZoom = 8;

const imageContainer = ref<HTMLElement | null>(null);
// Must be an HTMLImageElement to access naturalWidth/naturalHeight
const staticImage = ref<HTMLImageElement | null>(null);

// initial counding box of the image, used for enabling focal point
const staticImageBoundingBox = ref<DOMRect | null>(null);

// Zoom and pan state
const zoomLevel = ref<number>(1); // Default zoom level
const backgroundPositionX = ref<number>(0); // Background position X
const backgroundPositionY = ref<number>(0); // Background position Y
const prevBgW = ref<number>(0); // Previous background width (px)
const prevBgH = ref<number>(0); // Previous background height (px)
const portraitBaseScale = 1; // Base scale to fit image in container
const landscapeBaseScale = ref<number>(1); // Base scale to fit image in container


  
const startScale = ref<number>(1); // Initial scale for pinch zoom
const startX = ref<number>(0); // Initial X position for panning
const startY = ref<number>(0); // Initial Y position for panning
const panX = ref<number>(0); // Horizontal pan offset
const panY = ref<number>(0); // Vertical pan offset
const isPanning = ref<boolean>(false); // Track if the user is currently panning

const useTransition = ref<boolean>(false); // Enable transitions only for mouse wheel zoom

const isZoomed = ref<boolean>(false); // Track if the image is zoomed in


const isLandscape = () => {
  return window.innerWidth > window.innerHeight;
};

const getBaseScale = () => {
  if (isLandscape()) {
    return landscapeBaseScale.value;
  } else {
    return portraitBaseScale;
  }
}

/**
 * first, scale the background image according to zoom level
 * then, adjust the background position so that the focal point remains under the cursor
 */
const setBackgroundScaleAndPosition = (zoomLevel: number, focalX: number, focalY: number) => {
  // Pixel-based sizing using intrinsic image dimensions + contain scale
  if (imageContainer.value && staticImage.value) {
    const rect = imageContainer.value.getBoundingClientRect();
    const nW = staticImage.value.naturalWidth;
    const nH = staticImage.value.naturalHeight;
    if (!nW || !nH) return;

    // Base contain scale
    const s0 = Math.min(rect.width / nW, rect.height / nH);
    const s = s0 * zoomLevel;
    const bgW = nW * s;
    const bgH = nH * s;

    // Set background-size in pixels for consistent anchoring
    imageContainer.value.style.backgroundSize = `${bgW}px ${bgH}px`;

    // Contained image box at base (unzoomed)
    const w0 = nW * s0;
    const h0 = nH * s0;

    // Container-relative anchor
    const anchorX = focalX - rect.left;
    const anchorY = focalY - rect.top;

    // If no focal provided, center on current zoom
    if (anchorX === 0 && anchorY === 0) {
      const centerPosX = (rect.width - bgW) / 2;
      const centerPosY = (rect.height - bgH) / 2;
      backgroundPositionX.value = centerPosX;
      backgroundPositionY.value = centerPosY;
      imageContainer.value.style.backgroundPosition = `${backgroundPositionX.value}px ${backgroundPositionY.value}px`;
      prevBgW.value = bgW;
      prevBgH.value = bgH;
      return;
    }

    // Stateful focal anchoring: compute image-space focal from previous state
    const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
    const prevW = prevBgW.value || w0; // fall back to base contained width
    const prevH = prevBgH.value || h0; // fall back to base contained height
    let fx = (anchorX - backgroundPositionX.value) / prevW; // image-space x at anchor
    let fy = (anchorY - backgroundPositionY.value) / prevH; // image-space y at anchor
    // Clamp within image bounds
    fx = clamp(fx, 0, 1);
    fy = clamp(fy, 0, 1);

    const newPosX = anchorX - fx * bgW;
    const newPosY = anchorY - fy * bgH;

    backgroundPositionX.value = newPosX;
    backgroundPositionY.value = newPosY;
    imageContainer.value.style.backgroundPosition = `${newPosX}px ${newPosY}px`;
    prevBgW.value = bgW;
    prevBgH.value = bgH;
  }
};


const resetZoom = () => {

  useTransition.value = true; // Enable smooth transition for reset
  zoomLevel.value = 1;

  isZoomed.value = false;
  if (imageContainer.value && staticImageBoundingBox.value) {
    imageContainer.value.style.backgroundSize = `${staticImageBoundingBox.value.width}px ${staticImageBoundingBox.value.height}px`;
    imageContainer.value.style.backgroundPosition = `center center`;
    imageContainer.value.style.backgroundImage = 'none';
  }
  
  // Disable transitions after animation
  setTimeout(() => {
    useTransition.value = false;
  }, 300);

};


const setInitialBackgroundPosition = () => {
  if (imageContainer.value && staticImage.value) {

    if (staticImageBoundingBox.value === null) {
      staticImageBoundingBox.value = staticImage.value.getBoundingClientRect();
    }

    // set background image
    imageContainer.value.style.backgroundImage = `url('${props.image.imageUrl['4x']}')`;

    const rect = imageContainer.value.getBoundingClientRect();
    const nW = staticImage.value.naturalWidth;
    const nH = staticImage.value.naturalHeight;
    if (nW && nH) {
      const s0 = Math.min(rect.width / nW, rect.height / nH);
      const w0 = nW * s0;
      const h0 = nH * s0;
      backgroundPositionX.value = (rect.width - w0) / 2;
      backgroundPositionY.value = (rect.height - h0) / 2;
      prevBgW.value = w0;
      prevBgH.value = h0;
      // Set the base background size and position immediately to avoid a first-zoom jump
      imageContainer.value.style.backgroundSize = `${w0}px ${h0}px`;
      imageContainer.value.style.backgroundPosition = `${backgroundPositionX.value}px ${backgroundPositionY.value}px`;
    }
  }
};

// Clamp zoom to allowed range
const clampZoom = (z: number) => Math.max(getBaseScale(), Math.min(maxZoom, z));

// Ensure first-time zoom is initialized (centered contain and event emission)
const ensureZoomInitialized = () => {
  if (!isZoomed.value) {
    setInitialBackgroundPosition();
    isZoomed.value = true;
    emit('zoomed', isZoomed.value);
  }
};

// Apply a target zoom level with optional transition and focal anchoring
const applyZoomTo = (targetZoom: number, focalX: number, focalY: number, withTransition: boolean) => {
  zoomLevel.value = clampZoom(targetZoom);
  useTransition.value = withTransition;
  requestAnimationFrame(() => {
    setBackgroundScaleAndPosition(zoomLevel.value, focalX, focalY);
  });
};

const onPanStart = () => {
  // Initialize baseline and enable panning
  if (!isZoomed.value) {
    return;
  }
  isPanning.value = true;
  useTransition.value = false;
  startX.value = backgroundPositionX.value;
  startY.value = backgroundPositionY.value;
  panX.value = 0;
  panY.value = 0;
};

const onPan = (event: GestureEvent) => {
  if (!isZoomed.value || !isPanning.value) {
    return; // Ignore panning if not zoomed or not active
  }

  useTransition.value = false;
  const translationX = event.detail?.global?.deltaX ?? 0;
  const translationY = event.detail?.global?.deltaY ?? 0;
  panX.value = translationX;
  panY.value = translationY;
  const newPosX = startX.value + panX.value;
  const newPosY = startY.value + panY.value;
  backgroundPositionX.value = newPosX;
  backgroundPositionY.value = newPosY;
  if (imageContainer.value) {
    imageContainer.value.style.backgroundPosition = `${newPosX}px ${newPosY}px`;
  }
};

const onPanEnd = () => {
  if (!isPanning.value) return;
  // Persist final positions as new baseline
  startX.value = backgroundPositionX.value;
  startY.value = backgroundPositionY.value;
  isPanning.value = false;
  useTransition.value = false;
};

const onPinchStart = () => {
  // Use current zoom as pinch baseline; only initialize origin if not zoomed yet
  startScale.value = zoomLevel.value || getBaseScale();
  useTransition.value = false;
  if (!isZoomed.value) {
    setInitialBackgroundPosition();
    isZoomed.value = true;
    emit('zoomed', isZoomed.value);
  }
}

const onPinch = (event: GestureEvent) => {

  useTransition.value = false; 

  const scale = event.detail.global.scale;
  const baseScale = getBaseScale();

  const focalX = event.detail.global.center.x;
  const focalY = event.detail.global.center.y;

  // startScale is set on pinchstart to the current zoom level

  const newZoomLevel = Math.max(baseScale, Math.min(maxZoom, scale * startScale.value));

  if (Math.abs(newZoomLevel - zoomLevel.value) > 0.01) {
    ensureZoomInitialized();
    applyZoomTo(newZoomLevel, focalX, focalY, false);
  }
  
};

const onPinchEnd = () => {

  if (isZoomed.value === true) {
    if (zoomLevel.value <= 1.1) {
      resetZoom();
      isZoomed.value = false;
      emit('zoomed', isZoomed.value);
    }
  }
};

// Handle zooming with mouse wheel
const handleWheelZoom = (event: WheelEvent) => {

  event.preventDefault();
  // Avoid a jumpy first zoom: enable transition only after initial zoom
  useTransition.value = false; 

  const zoomStep = 0.1;
  const focalX = event.clientX;
  const focalY = event.clientY;

  ensureZoomInitialized();
  const target = event.deltaY < 0 ? (zoomLevel.value + zoomStep) : (zoomLevel.value - zoomStep);
  applyZoomTo(target, focalX, focalY, true);
  // If clamped back to base scale, treat as reset
  if (zoomLevel.value <= getBaseScale()) {
    resetZoom();
    isZoomed.value = false;
    emit('zoomed', isZoomed.value);
  }
  // Disable transitions shortly after the zoom finishes
  setTimeout(() => {
    useTransition.value = false;
  }, 300);
  
};


onMounted(() => {
  const options = {
    supportedGestures: [Pan, Pinch],
    handleTouchEvents: true,
  };

  nextTick(() => {
    if (imageContainer.value) {
      new PointerListener(imageContainer.value, options);
    }
  });

  if (imageContainer.value) {
    // Add gesture event listeners
    imageContainer.value.addEventListener('gesturestart', (event) => {
      event.preventDefault(); // Prevent default pinch-to-zoom behavior
    });

    imageContainer.value.addEventListener('gesturechange', (event) => {
      event.preventDefault(); // Prevent default pinch-to-zoom behavior
    });

    imageContainer.value.addEventListener('gestureend', (event) => {
      event.preventDefault(); // Prevent default pinch-to-zoom behavior
    });
  }
});
</script>

<template>
  <div
    ref="imageContainer"
    class="image-container"
    :class="{ 'with-transition': useTransition, 'zoomed': isZoomed }"
    @wheel="handleWheelZoom"
    @pinchstart="onPinchStart"
    @pinch="onPinch"
    @pinchend="onPinchEnd"
    @panstart="onPanStart"
    @pan="onPan"
    @panend="onPanEnd"
  >
    <img
      ref="staticImage"
      loading="lazy"
      draggable="false"
      :src="image.imageUrl['2x']"
      :srcset="srcSetFn(image.imageUrl)"
      @panstart="onPanStart"
      :sizes="sizes ? sizes : ''"
      :alt="`{{ taxonLatname }} {{ taxonAuthor }}`"
      :class="rounded ? rounded : 'sharp'"
      @pan="onPan"
      @panend="onPanEnd"
      :title="title ? title : undefined"
    />
    <LicenceCircle
      v-if="!isZoomed"
      :imageUrl="image.imageUrl['4x']"
      class="image-licence-circle"
      :sharp="sharpLicenceCircle"
    />
    <!-- Caption overlay -->
    <div v-if="showCaption && image.text" class="caption-overlay">
      <div class="caption-content" v-html="image.text"></div>
    </div>
  </div>
</template>

<style scoped>
.image-container {
  width: 100%;
  height: 100%;
  background-repeat: no-repeat;
  background-position: center center;
  background-size: 0px 0px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow: hidden;
}


.image-container img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center center;
}

.image-container.with-transition {
  transition: background-size 0.3s ease, background-position 0.3s ease; /* Smooth transition for zooming */
  will-change: background-size, background-position;
}

.image-container.zoomed img {
  display: none; /* Hide the img element when zoomed */
}

.image-licence-circle {
  position: absolute;
  right: -9px;
  bottom: -9px;
  z-index: 3; /* Above caption overlay */
}


.caption-overlay {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 0 var(--size-md);
  background: rgba(0, 0, 0, 0.55);
  z-index: 2;
  pointer-events: none; /* Let pointer events pass through to the image */
  max-width: 100%;
}

.caption-content {
  text-align: center;
  font-family: 'RobotoCondensed';
  font-weight: 400;
  font-size: var(--font-size-lg);
  color: #fff;
}
</style>