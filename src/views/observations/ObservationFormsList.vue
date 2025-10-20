<script setup lang="ts">
import { inject } from 'vue';
import type { Features } from 'localcosmos-client';
import ContentContainer from '@/components/container/ContentContainer.vue';
import CardLink from '@/components/ui/CardLink.vue';
import CardList from '@/components/container/CardList.vue';

const features = inject('features') as Features;
</script>

<template>
  <ContentContainer>
    <div class="page page-padding">
      <div class="container">
        <CardList v-if="features.GenericForm">
          <div v-for="form in features.GenericForm.list" :key="form.uuid">        
            <RouterLink :to="{ name: 'observation-form-slug', params: { slug: form.slug } }" class="card-link nolinkstyle">
              <CardLink :title="form.name" :text="form.description"></CardLink>
            </RouterLink>
          </div>
        </CardList>
        <div v-else>
          <div class="alert alert-danger">
            {{ $t('observationForm.NoObservationFormsAvailable') }}
          </div>
        </div>
      </div>
    </div>
  </ContentContainer>
</template>