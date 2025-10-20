<script setup lang="ts">
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import ObservationForm from '@/views/observations/ObservationForm.vue';
import OnlinePage from '@/components/container/OnlinePage.vue';
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue';
const route = useRoute();

const datasetUuid = route.params.uuid as string;

const componentKey = ref<string>(datasetUuid);
</script>

<template>
  <OnlinePage :key="componentKey">
    <Suspense>
        <template #fallback>
          <LoadingSpinner />
        </template>

        <ObservationForm :dataset-uuid="datasetUuid" />
    </Suspense>
  </OnlinePage>
</template>
