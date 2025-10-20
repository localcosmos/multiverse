<script setup lang="ts">
import ContentContainer from '@/components/container/ContentContainer.vue';
</script>

<template>
  <ContentContainer>
    <div class="page page-padding">
      <div class="container-small">
        <div class="my-xl">
          <h1>{{ $t('MyAccount.deleteSuccess') }}</h1>
        </div>
      </div>
    </div>
  </ContentContainer>
</template>