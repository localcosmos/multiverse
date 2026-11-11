<script setup lang="ts">
import { ref, computed, onMounted, getCurrentInstance } from "vue";
import type { ImageWithTextAndLicence } from "localcosmos-client";
import { MasonryWall } from "@yeger/vue-masonry-wall";
import ImageWithLicence from "./ImageWithLicence.vue";
import ImagesModal from "./ImagesModal.vue";

type MasonryImage = ImageWithTextAndLicence & { aspectRatio: string };

const props = withDefaults(
  defineProps<{
    images: ImageWithTextAndLicence[];
    minColumns?: number;
    gap?: number;
    modalId?: string;
  }>(),
  {
    minColumns: 2,
    gap: 16,
  },
);

const instanceUid = getCurrentInstance()?.uid ?? Math.random();
const resolvedModalId = computed(
  () => props.modalId || `image-masonry-modal-${instanceUid}`,
);

const masonryImages = ref<MasonryImage[]>([]);
const imagesModal = ref<InstanceType<typeof ImagesModal> | null>(null);

const preloadImage = (
  url: string,
): Promise<{ width: number; height: number }> =>
  new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () =>
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => resolve({ width: 4, height: 3 });
    img.src = url;
  });

onMounted(async () => {
  const loaded = await Promise.all(
    props.images.map(async (image) => {
      const url = image.imageUrl["1x"];
      const { width, height } = await preloadImage(url);
      return { ...image, aspectRatio: `${width} / ${height}` } as MasonryImage;
    }),
  );
  masonryImages.value = loaded;
});

const openModal = (index: number) => {
  imagesModal.value?.open(index);
};

const asMasonryImage = (item: unknown): MasonryImage => item as MasonryImage;
</script>

<template>
  <div class="image-masonry">
    <MasonryWall :items="masonryImages" :min-columns="minColumns" :gap="gap">
      <template #default="{ item, index }">
        <div
          class="masonry-item"
          :style="{ aspectRatio: asMasonryImage(item).aspectRatio }"
          @click="openModal(index)"
        >
          <ImageWithLicence
            :image="asMasonryImage(item)"
            :show-caption="false"
          />
        </div>
      </template>
    </MasonryWall>

    <ImagesModal
      ref="imagesModal"
      :images="masonryImages"
      :modal-id="resolvedModalId"
    />
  </div>
</template>

<style scoped>
.image-masonry {
  width: 100%;
}

.masonry-item {
  cursor: pointer;
  overflow: hidden;
}

.masonry-item :deep(.image-container img) {
  transition: transform 0.25s ease;
}

.masonry-item:hover :deep(.image-container img) {
  transform: scale(1.03);
}
</style>
