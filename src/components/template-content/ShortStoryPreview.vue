<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router';
import TemplateContentLink from '@/components/ui/TemplateContentLink.vue';

const props = defineProps<{
  title: string;
  imageText?: string | null;
  scientificName?: string | null;
  imageStyle?: Record<string, string>;
  ariaLabel?: string;
  to?: RouteLocationRaw;
  templateName?: string;
  slug?: string;
}>();

const hasTemplateLink = props.templateName && props.slug;
const resolvedAriaLabel = props.ariaLabel || props.title;
</script>

<template>
  <RouterLink v-if="to" :to="to" class="nolinkstyle">
    <div class="article-preview">
      <div class="article-image" :style="imageStyle" role="img" :aria-label="resolvedAriaLabel">
        <div class="article-image-overlay"></div>
        <div v-if="imageText" class="article-image-text">
          {{ imageText }}
        </div>
      </div>
      <div class="article-content">
        <div class="article-title">
          {{ title }}
        </div>
        <div v-if="scientificName" class="article-scientific-name">
          <i>{{ scientificName }}</i>
        </div>
      </div>
    </div>
  </RouterLink>

  <TemplateContentLink
    v-else-if="hasTemplateLink"
    :templateName="templateName as string"
    :slug="slug as string"
    class="short-story-preview-link"
  >
    <div class="article-preview">
      <div class="article-image" :style="imageStyle" role="img" :aria-label="resolvedAriaLabel">
        <div class="article-image-overlay"></div>
        <div v-if="imageText" class="article-image-text">
          {{ imageText }}
        </div>
      </div>
      <div class="article-content">
        <div class="article-title">
          {{ title }}
        </div>
        <div v-if="scientificName" class="article-scientific-name">
          <i>{{ scientificName }}</i>
        </div>
      </div>
    </div>
  </TemplateContentLink>

  <div v-else class="article-preview">
    <div class="article-image" :style="imageStyle" role="img" :aria-label="resolvedAriaLabel">
      <div class="article-image-overlay"></div>
      <div v-if="imageText" class="article-image-text">
        {{ imageText }}
      </div>
    </div>
    <div class="article-content">
      <div class="article-title">
        {{ title }}
      </div>
      <div v-if="scientificName" class="article-scientific-name">
        <i>{{ scientificName }}</i>
      </div>
    </div>
  </div>
</template>

<style scoped>
.short-story-preview-link {
  display: block;
  text-decoration: none;
}

.article-preview {
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: var(--transition-cubic);
  background: var(--color-neutral);
}

.article-title {
  font-size: var(--font-size-2xl);
  font-family: var(--font-lusitana-1001);
  font-weight: 600;
  color: var(--color-neutral);
}

.article-scientific-name {
  color: var(--color-neutral);
  font-size: var(--font-size-lg);
  font-family: var(--font-public-sans-1001);
}

.article-image {
  position: relative;
  width: 100%;
  margin: 0 auto;
  aspect-ratio: 4 / 3;
  min-height: 180px;
  background-color: var(--color-neutral);
  background-image: var(--article-image-fallback);
  background-image: var(--article-image-set);
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.article-content {
  background: #FFFFFF;
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: var(--size-lg) var(--size-xl);
  color: var(--color-neutral);
}

.article-image-text {
  position: absolute;
  z-index: 1;
  left: 0;
  bottom: 0;
  text-align: left;
  color: #FFFFFF;
  font-family: var(--font-lusitana-1001);
  font-size: var(--font-size-2xl);
  font-weight: 600;
  padding: var(--size-lg);
}

.article-image-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(circle at center, rgba(0, 0, 0, 0.2) 20%, rgba(0, 0, 0, 0.68) 100%);
  z-index: 0;
}

@media (min-width: 768px) {
  .article-content {
    min-height: 7rem;
  }
}
</style>
