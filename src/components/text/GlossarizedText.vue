<script setup lang="ts">
import type { Ref } from 'vue';
import { ref, inject, onMounted } from 'vue';

const props = defineProps<{
  htmlText: string
}>();

const glossaryBubble:Ref = inject('glossaryBubble') as Ref;

const glossaryText = ref<HTMLElement|null>(null);

function showBubble (event:MouseEvent) {
  const eventTarget = event.currentTarget as HTMLElement;
  const oldValue = glossaryBubble.value;

  const termB64 = eventTarget.getAttribute('data-term');

  if (oldValue && oldValue.termB64 === termB64 && event.detail) {
    hideBubble();
  } else {
    const clientRect = eventTarget.getBoundingClientRect();
    const x = clientRect.left;
    const y = clientRect.top;

    glossaryBubble.value = {
      termB64,
      x,
      y,
    };
  }
}

function hideBubble () {
  glossaryBubble.value = null;
}

onMounted(() => {
  if (glossaryText.value) {
    const glossaryLinks: NodeListOf<HTMLElement> = glossaryText.value.querySelectorAll('.glossary_link') as NodeListOf<HTMLElement>;
    glossaryLinks.forEach((glossaryLink) => {
      glossaryLink.addEventListener('mouseover', showBubble);
      glossaryLink.addEventListener('mouseout', hideBubble);

      glossaryLink.addEventListener('click', function (event) {
        const eventTarget = event.currentTarget as HTMLElement;
        event.stopPropagation();
        showBubble(event);
        eventTarget.addEventListener('click', function (event) {
          event.preventDefault();
          event.stopPropagation();
        }, { once: true });
        window.addEventListener('pointerdown', hideBubble, { once: true });
      });
    });
  }
});

</script>

<template>
  <span
    ref="glossaryText"
    v-html="htmlText"
  ></span>
</template>
