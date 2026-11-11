<script setup lang="ts">
import TemplateContentContainer from '@/components/container/TemplateContentContainer.vue';
import SponsorStripe from '@/components/template-content/SponsorStripe.vue';
</script>

<template>
  <TemplateContentContainer :loading="false">
    <div class="sponsor-stripe-preview">
      <SponsorStripe />
    </div>
  </TemplateContentContainer>
</template>

<style scoped>
.sponsor-stripe-preview {
  height:100vh;
  height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>


<style scoped>
</style>
