<script setup lang="ts">
import type { SearchTaxon } from 'localcosmos-client';
import ImageWithLicence from '@/components/images/ImageWithLicence.vue';

const props = defineProps<{
  taxon: SearchTaxon,
}>();

</script>

<template>
  <RouterLink
      :to="{ name: 'taxon-profile-nameuuid', params: { nameUuid: taxon.nameUuid } }"
      class="nolinkstyle"
    >
    <div class="taxon-row bg-translucent-light">
      <div class="taxon-name-container">
        <div>
          <div>
            <span class="taxon-primary-name">{{ taxon.name }}</span>
          </div>
          <div>
            <span class="taxon-latname">
              {{ taxon.taxonLatname }}
              <span v-if="taxon.taxonAuthor">
                {{ taxon.taxonAuthor }}
              </span>
            </span>
          </div>
        </div>
      </div>
      <div
        v-if="taxon.image"
        class="taxon-profile-image-container"
      >
        
          <ImageWithLicence
            :image="taxon.image"
            :rounded="'rounded-xs'"
            :title="taxon.name"
          />
      </div>
    </div>
  </RouterLink>
</template>

<style scoped>
.taxon-row {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  padding: calc(var(--size-md) /2) var(--size-md);
  border-bottom: 1px solid var(--color-grey-light);
}

.taxon-name-container {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: var(--gap-medium);
  justify-content: center;
  align-items: flex-start;
}

.taxon-profile-image-container {
  position: relative;
}

.taxon-primary-name {
  font-weight: bold;
}

.taxon-latname {
  font-style: italic;
}

.taxon-profile-image-container {
  height: 70px;
  aspect-ratio: 1/1;
  border-radius: var(--border-radius-xs);
}

.searchresult-image-licence-circle {
  position: absolute;
  bottom: -4px;
  left: -4px;
}
</style>