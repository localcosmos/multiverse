<script setup lang="ts">
import GlossarizedText from './GlossarizedText.vue';
import { useTranslation } from 'i18next-vue';

const { t } = useTranslation();

const props = defineProps<{
  textKey: string
}>();

const translatedText = t(props.textKey);

</script>

<template>
  <GlossarizedText
    v-if="translatedText"
    :html-text="translatedText"
  />
</template>