<script setup lang="ts">
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import ObservationForm from '@/views/observations/ObservationForm.vue';
const route = useRoute();

const datasetUuid = route.params.uuid as string;

const componentKey = ref<string>(datasetUuid);
</script>

<template>
  <div :key="componentKey">
    <Suspense>
        <template #fallback>
            <div>loading</div>
        </template>

        <ObservationForm :dataset-uuid="datasetUuid" :is-idb-dataset="true" />
    </Suspense>
  </div>
</template>
