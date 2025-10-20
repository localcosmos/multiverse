<script setup lang="ts">
import { computed } from 'vue';
import { Node, NodeType } from 'localcosmos-client';
import type { ImageWithTextAndLicence } from 'localcosmos-client';
import ImageWithLicence from '../images/ImageWithLicence.vue';
import { useRouter } from 'vue-router';
import { useNatureGuideStore } from '@/stores/nature-guides';
import { useModalBottomSheet } from '@/stores/modal-bottomsheet';
import { calculatePercentageColor } from '@/composables/calculatePercentageColor';

const props = defineProps<{
  node: Node;
}>();

const router = useRouter();
const natureGuideStore = useNatureGuideStore();
const modalBottomSheet = useModalBottomSheet();

let nodeImage: ImageWithTextAndLicence|null = null;

if (props.node.data.imageUrl) {
  nodeImage = {
    imageUrl: props.node.data.imageUrl,
  };
}

const goToNextStep = () => {
  
  natureGuideStore.pushLastStep();

  if (natureGuideStore.natureGuide) {
    if (props.node.data.nodeType === NodeType.node) {
      // go to nature-guide with node slug
      router.push({ name: 'nature-guide', params: { guideSlug: natureGuideStore.natureGuide.slug, nodeSlug: props.node.slug } });
    } else {
        modalBottomSheet.destroy();
      router.push({
        name: 'taxon-profile-nameuuid',
        params: { nameUuid: props.node.data.taxon.nameUuid },
      });
    }
  }
};

const pointsColor = computed(() => {
  return calculatePercentageColor(props.node.points, props.node.data.maxPoints);
});

</script>

<template>
  <div
    class="node cursor-pointer"
    :class="{
      impossible: !node.isPossible,
    }"
    @click="goToNextStep"
    :style="`order: -${node.points}`"
  >
    <div class="node-points" :style="`background-color: ${pointsColor}`">
      <span class="font-bold">{{ node.points }}</span>
      <span class="text-xs">/{{ node.data.maxPoints }}</span>
    </div>
    <div class="node-name">
      <div class="font-bold">
        {{ node.name }}
      </div>
      <div v-if="node.data.taxon" class="node-scientific-name">
        <i>{{ node.data.taxon.taxonLatname }}</i>
      </div>
    </div>
    <div class="node-image">
      <ImageWithLicence
        v-if="nodeImage"
        :image="nodeImage"
      />
      <img
        v-else
        class ="no-img"
        src="@/assets/images/no-image.svg"
      >
    </div>
  </div>
</template>

<style scoped>
.node {
  display: grid;
  grid-template-columns: 75px 1fr 100px;
  border-radius: var(--border-radius-sm);
  background: var(--color-white-translucent-light);
}

.node-name {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  font-size: var(--font-size-xl);
  padding: 4px 0 4px var(--size-md);
}

.node-points {
  height: 100%;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  border-radius: var(--border-radius-sm) 0 0 var(--border-radius-sm);
  font-size: var(--font-size-xl);
}

.node-scientific-name {
  font-size: var(--font-size-lg);
}

.node.impossible {
  opacity: 0.5;
}

.node-image {
  width: 100%;
  height: auto;
  aspect-ratio: 1 / 1;
  padding: 4px;
}

.node-image img.no-img {
  width: 100%;
  aspect-ratio: 1 / 1;
}

.node-image, .node-image .image-container, .node-image img {
  border-radius: var(--border-radius-sm);
}

@media (min-width: 640px) {
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