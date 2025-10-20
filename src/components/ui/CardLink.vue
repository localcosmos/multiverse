<script setup lang="ts">
import type { ImageWithTextAndLicence } from 'localcosmos-client';
import { imageUrlsToSrcSet } from '@/composables/imageUrlsToSrcSet';

const props = defineProps<{
  title: string;
  image?: ImageWithTextAndLicence;
  text?: string;
}>();
</script>

<template>
  <div class="card">
    <div class="card-image" v-if="props.image">
      <img
        :src="props.image.imageUrl['2x']"
        :srcset="imageUrlsToSrcSet(props.image.imageUrl)"
        :alt="props.image.text || props.title"
        :sizes="'(min-width: 768px) 320px, 100vw'"
      />
    </div>
    <div class="card-content">
      <div class="card-title">{{ props.title }}</div>
      <div v-if="props.text" class="card-text">{{ props.text }}</div>
      <slot />
    </div>
  </div>
</template>

<style scoped>
.card-link {
  text-decoration: none;
  color: inherit;
  display: block;
}

.card {
  display: flex;
  flex-direction: column;
  border-radius: var(--border-radius-sm, 12px);
  box-shadow: var(--box-shadow);
  background: #fff;
  overflow: hidden;
  transition: box-shadow 0.2s;
}

.card:hover {
  box-shadow: var(--box-shadow-hover);
}

.card-image img {
  width: 100%;
  height: auto;
  display: block;
  object-fit: cover;
}

.card-content {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.card-title {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.card-text {
  font-size: 1rem;
  color: var(--text-muted);
}
</style>