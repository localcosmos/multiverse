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

const interactiveImage = ref<HTMLElement | null>(null);
const imageContainer = ref<HTMLElement | null>(null);
const zoomWrapper = ref<HTMLElement | null>(null);

// Zoom and pan state
const zoomLevel = ref<number>(1); // Default zoom level
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

const getViewportDimensions = () => {
  if (window.visualViewport) {
    return {
      width: window.visualViewport.width,
      height: window.visualViewport.height
    };
  }
  // Fallback
  return {
    width: window.innerWidth,
    height: window.innerHeight
  };
};

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

const setImageScaleAndTransform = () => {
  if (zoomWrapper.value) {
    zoomWrapper.value.style.transform = `scale(${zoomLevel.value}) translate3d(${panX.value}px, ${panY.value}px, 0)`;
  }
};

const zoomIn = (zoomStep: number) => {

  const baseScale = getBaseScale();

  let newZoomLevel: number = 0;

  if (isZoomed.value == false) {
    // first zoom in
    newZoomLevel = (zoomLevel.value * baseScale) + zoomStep;
    isZoomed.value = true;
    emit('zoomed', isZoomed.value);
  } else {
    newZoomLevel = zoomLevel.value + zoomStep;
    useTransition.value = true;
  }

  zoomLevel.value = Math.min(3, newZoomLevel);

  setImageScaleAndTransform();

  setTimeout(() => {
    useTransition.value = false;
  }, 300); // Match the CSS transition duration

};

const zoomOut = (zoomStep: number) => {
  if (isZoomed.value == true) {

    const newZoomLevel = zoomLevel.value - zoomStep;

    zoomLevel.value = Math.max(getBaseScale(), newZoomLevel);
    useTransition.value = true;
    setImageScaleAndTransform();
    setTimeout(() => {
      useTransition.value = false;

      if (zoomLevel.value <= getBaseScale()) {
        // reset pan and zoom
        resetZoom();

        setImageScaleAndTransform();

        isZoomed.value = false;
        emit('zoomed', isZoomed.value);
      }

    });
  }
};

const onPan = (event: GestureEvent) => {
  if (isZoomed.value === false) {
    return; // Ignore panning if not zoomed in
  }
  
  const currentZoom = zoomLevel.value;
  const deltaX = (event.detail.global.deltaX + startX.value) / currentZoom;
  const deltaY = (event.detail.global.deltaY + startY.value) / currentZoom;
  
  isPanning.value = true;
  panX.value = deltaX;
  panY.value = deltaY;
  
  requestAnimationFrame(() => {
    setImageScaleAndTransform();
  });
};

const onPanEnd = () => {
  isPanning.value = false;
  startX.value = panX.value * zoomLevel.value;
  startY.value = panY.value * zoomLevel.value;
};

const onPinch = (event: GestureEvent) => {
  
  const scale = event.detail.global.scale;
  const baseScale = getBaseScale();

  if (isZoomed.value === false) {
    startScale.value = baseScale;
  } 

  const newZoomLevel = scale * startScale.value;

  if (Math.abs(newZoomLevel - zoomLevel.value) > 0.01) {

    if (isZoomed.value === false) {
      isZoomed.value = true;
      emit('zoomed', isZoomed.value);
    }

    zoomLevel.value = newZoomLevel;

    requestAnimationFrame(() => {
      setImageScaleAndTransform();
    });
  }

  
};

const onPinchEnd = (event: GestureEvent) => {
  const scale = event.detail.global.scale;
  startScale.value = scale * startScale.value; // Update the start scale
  const baseScale = getBaseScale();

  if (isZoomed.value === true) {
    if (zoomLevel.value <= baseScale) {
      resetZoom();
      requestAnimationFrame(() => {
        setImageScaleAndTransform();
      });
      isZoomed.value = false;
      emit('zoomed', isZoomed.value);
    }
  }
};

// Handle zooming with mouse wheel
const handleWheelZoom = (event: WheelEvent) => {
  
  event.preventDefault();

  const zoomStep = 0.1;

  if (event.deltaY < 0) {
    zoomIn(zoomStep);
  } else {
    zoomOut(zoomStep);
  }
};

// Reset zoom to default state
const resetZoom = () => {
  useTransition.value = true; // Enable smooth transition for reset
  zoomLevel.value = 1;
  panX.value = 0;
  panY.value = 0;
  startX.value = 0;
  startY.value = 0;
  startScale.value = 1;
  isPanning.value = false;
  
  // Disable transitions after animation
  setTimeout(() => {
    useTransition.value = false;
  }, 300);
};

// Expose the resetZoom method to parent components
defineExpose({
  resetZoom
});

onMounted(() => {
  // calculate baseScale for landscape zooming
  if (imageContainer.value) {
    const originalRect = imageContainer.value.getBoundingClientRect();
    const viewportDimensions = getViewportDimensions();
    const viewportWidth = viewportDimensions.width;
    const viewportHeight = viewportDimensions.height;

    const largerEdge = Math.max(viewportHeight, viewportWidth);
    landscapeBaseScale.value = (originalRect.width * 0.95 / largerEdge);
  }

  const options = {
    supportedGestures: [Pan, Pinch],
    handleTouchEvents: false, // keep the swipe-through-images alive
  };

  nextTick(() => {
    if (interactiveImage.value) {
      new PointerListener(interactiveImage.value, options);
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
    class="image-container zoomable"
    :class="{ zoomed: isZoomed }"
    @wheel="handleWheelZoom"
    @pinch="onPinch"
    @pinchend="onPinchEnd"
    @touchstart.passive="true"
    @touchmove.prevent
  >
    <!-- Wrapper for zooming -->
    <div
      ref="zoomWrapper"
      class="zoom-wrapper"
      :class="{ 'with-transition': useTransition }"
    >
      <!-- Image for panning -->
      <img
        ref="interactiveImage"
        @pan="onPan"
        @panend="onPanEnd"
        loading="lazy"
        draggable="false"
        :src="image.imageUrl['2x']"
        :srcset="srcSetFn(image.imageUrl)"
        :sizes="sizes ? sizes : ''"
        :alt="`{{ taxonLatname }} {{ taxonAuthor }}`"
        :class="rounded ? rounded : 'sharp'"
        :title="title ? title : undefined"
      />
      
      <LicenceCircle
        v-if="!isZoomed"
        :imageUrl="image.imageUrl['1x']"
        class="image-licence-circle"
        :sharp="sharpLicenceCircle"
      />
      <!-- Caption overlay -->
      <div v-if="showCaption && image.text" class="caption-overlay">
        <div class="caption-content" v-html="image.text"></div>
      </div>
    </div>
    
  </div>
</template>

<style scoped>
.image-container {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden; /* Prevent any overflow from affecting layout */
  cursor: grab; /* Indicate panning is possible */
  display: flex;
  align-items: center;
  justify-content: center;

}

.image-container.zoomed {
  cursor: grabbing;
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  width: 100dvw;
  height: 100vh;
  height: 100dvh;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: visible;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: none;
  /* iOS Safari specific fixes */
  inset: 0; /* Modern way to set top, right, bottom, left to 0 */
  z-index: 9999; /* Ensure it's above everything */
}

.image-container.zoomed {
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.image-container.zoomed::-webkit-scrollbar {
  display: none;
}

.image-container:active {
  cursor: grabbing; /* Indicate panning is active */
}

.zoom-wrapper {
  position: relative; /* Needed for absolute overlay positioning */
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  transform-origin: center center; /* Zoom from the center */
  will-change: transform;
  transform: translate3d(0, 0, 0); /* Force hardware acceleration */
  -webkit-transform: translate3d(0, 0, 0); /* WebKit prefix für Android */
  backface-visibility: hidden; 
  -webkit-backface-visibility: hidden;
}

/* When zoomed, ensure wrapper fills entire screen */
.image-container.zoomed .zoom-wrapper {
  width: 100vw;
  height: 100vh;
  width: 100dvw;
  height: 100dvh;
}

.zoom-wrapper.with-transition {
  transition: transform 0.3s ease; /* Smooth transition for zooming */
}

.image-container img {
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  object-fit: contain;
  display: block;
}

.image-container.zoomed img {
  width: auto;
  height: auto;
  max-width: none;
  max-height: none;
  object-fit: none;
  /* iOS Safari specific fixes */
  -webkit-transform: translateZ(0); /* Force hardware acceleration */
  transform: translateZ(0); /* Standard property */
}

.image-licence-circle {
  position: absolute;
  right: -9px;
  bottom: -9px;
  z-index: 3; /* Above caption overlay */
}

.image-container[style*="scale(1)"] {
  cursor: default; /* Disable grab cursor when zoomLevel is 1 */
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
  text-align: left;
  font-family: 'RobotoCondensed';
  font-weight: 400;
  font-size: var(--font-size-lg);
  color: #fff;
}
</style>