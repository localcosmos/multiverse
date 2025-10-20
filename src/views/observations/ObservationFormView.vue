<script setup lang="ts">
import { inject, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import type { Features } from 'localcosmos-client';
import ObservationForm from './ObservationForm.vue';
import ContentContainer from '@/components/container/ContentContainer.vue';

const route = useRoute();

const features = inject('features') as Features;

const formSlug = route.params.slug as string;
const genericFormUuid = ref<string|null>(null);

let initialKey = 'defaultGenericForm';

if (features.GenericForm) {
    initialKey = features.GenericForm?.default.slug;
}
const componentKey = ref<string>(initialKey);

if (formSlug) {
    genericFormUuid.value = features.slugs[formSlug];
}

watch(
  () => route.params.slug,
  async (newSlug, oldSlug) => {
    let usedSlug = initialKey;
    if (newSlug) {
        usedSlug = `${newSlug}`;
    }
    genericFormUuid.value = features.slugs[usedSlug];
    componentKey.value = usedSlug;
  }
);
</script>

<template>
  <ContentContainer :key="componentKey">
    <Suspense>
        <template #fallback>
            <div>loading</div>
        </template>

        <ObservationForm :generic-form-uuid="genericFormUuid" />
    </Suspense>
  </ContentContainer>
</template>