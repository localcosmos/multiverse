<script setup lang="ts">
import { ref, onMounted, onUpdated, inject } from 'vue';
import { useTranslation } from 'i18next-vue';
import { Glossary } from 'localcosmos-client';

const glossary = inject('glossary') as Glossary | null;

const { t } = useTranslation();

const props = defineProps<{
  termB64: string,
  x: number,
  y: number
}>();

const bubble= ref<HTMLElement | null>(null);
const definition = ref<string>('');
const term = ref<string>('');

// Modern approach using Buffer (if available in your environment)
const decodeBase64Unicode = (base64String: string): string => {
  try {
    // Check if we're in a Node.js-like environment with Buffer
    if (typeof Buffer !== 'undefined') {
      return Buffer.from(base64String, 'base64').toString('utf-8');
    }
    
    // Browser environment with TextDecoder
    const binaryString = window.atob(base64String);
    const bytes = new Uint8Array(binaryString.length);
    
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    return new TextDecoder('utf-8').decode(bytes);
  } catch (error) {
    console.error('Base64 decode error:', error);
    return '';
  }
};

function positionBubble () {
  if (bubble.value) {
    const leftX = props.x;
    if (leftX + 250 > screen.width) {
      bubble.value.style.right = '10px';
    } else {
      bubble.value.style.left = props.x + 'px';
    }
    bubble.value.style.top = props.y - bubble.value.clientHeight - 20 + 'px';
  }
}

function loadGlossaryEntry () {
  if (glossary) {
    const termDefinition = glossary.definition(props.termB64);
    definition.value = t(termDefinition, {ns: 'plain'});
    
    // ✅ Properly handle Unicode characters
    const termText = decodeBase64Unicode(props.termB64);
    term.value = termText;
  }
}

onMounted(() => {
  loadGlossaryEntry();
  positionBubble();
});
onUpdated(() => {
  loadGlossaryEntry();
  positionBubble();
});

</script>

<template>
  <div
    id="glossary-bubble"
    ref="bubble"
    class=""
  >
    <div><strong>{{ term }}</strong></div>
    {{ definition }}
  </div>
</template>

<style scoped>
#glossary-bubble {
    position: fixed;
    width: 250px;
    z-index: 101;
    transition: opacity 0.5s ease;
    background: #FFF;
    padding: var(--size-md);
    border-radius: var(--border-radius-sm);
    box-shadow: var(--box-shadow);
}
</style>
