<script setup lang="ts">
import { inject } from 'vue';
import ContentContainer from '@/components/container/ContentContainer.vue';
import { t } from 'i18next';
import CardLink from '@/components/ui/CardLink.vue';
import { usePermissionsStore } from '@/stores/permissions';
import ColorButton from '@/components/ui/ColorButton.vue';
import type { Features } from 'localcosmos-client';
import { useRouter } from 'vue-router';

import CardList from '@/components/container/CardList.vue';

const router = useRouter();

const features = inject('features') as Features;

const permissions = usePermissionsStore();

const newObservation = () => {

  if (permissions.canUseDatasets) {
    if (features.GenericForm){
      if (features.GenericForm.list.length === 1) {
        router.push({ name: 'observation-form' })
      } else {
        router.push({ name: 'observation-forms-list' });
      }
    }
  }
};

</script>

<template>
  <ContentContainer>
    <div class="page page-padding">
      <div class="container">
        <div v-if="permissions.canUseDatasets" class="flex">
          <ColorButton
            :text="t('navigation.NewObservation')"
            @click="newObservation"
          ></ColorButton>
        </div>
        <CardList>
          <RouterLink
            v-if="permissions.canUseDatasets"
            :to="{ name: 'my-observations' }"
            class="card-link nolinkstyle"
          >
            <CardLink :title="t('navigation.MyObservations')"></CardLink>
          </RouterLink>
          
          <RouterLink :to="{ name: 'my-observations' }" class="card-link nolinkstyle">
            <CardLink :title="t('Observations')"></CardLink>
          </RouterLink>

          <RouterLink :to="{ name: 'my-observations' }" class="card-link nolinkstyle">
            <CardLink :title="t('Newest Observations')"></CardLink>
          </RouterLink>

          <RouterLink :to="{ name: 'my-observations' }" class="card-link nolinkstyle">
            <CardLink :title="t('Featured Observations')"></CardLink>
          </RouterLink>
        </CardList>
      </div>
    </div>
  </ContentContainer>
</template>

<style scoped>


</style>