<script setup lang="ts">
import type { LocalizedGlossary } from 'localcosmos-client';

const props = defineProps<{
  localizedGlossary: LocalizedGlossary,
  termIdPrefix: string,
}>();
</script>

<template>
  <div
    v-for="(terms, letter) in localizedGlossary"
    :key="letter"
    class="glossary-letter"
    :id="`glossary-${letter}`"
  >
    <div
      v-for="(definition, term) in terms"
      :key="term"
      class="glossary-item"
    >
      <div
        :id="`${termIdPrefix}${term}`"
        class="glossary-terms"
      >
        <div class="glossary-term">
          {{ term }}
        </div>
        <div class="glossary-definition">
          {{ definition.definition }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* For smallest screens (mobile): term above definition */
.glossary-terms {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--size-md);
  padding: var(--size-md) 0;
}


.glossary-term {
  font-weight: bold;
}


/* For tablets and up: term next to definition */
@media (min-width: 640px) {
  .glossary-terms {
    grid-template-columns: 1fr 2fr;
    gap: 1rem;
    align-items: start;
  }
  
  .glossary-term {
    padding-right: 1rem;
  }
}

@media (min-width: 768px) {
  .glossary-terms {
    grid-template-columns: 1fr 3fr;
  }

  .glossary-buttons {
    top: 0px;
    margin-left: var(--navigation-rail-width);
  }

  .glossary-search {
    justify-content: center;
    align-self: center; /* <-- Add this line */
  }
}

@media (min-width: 1024px) {
  .glossary-terms {
    grid-template-columns: 1fr 4fr;
  }
}

@media (min-width: 1280px) {
  .glossary-terms {
    grid-template-columns: 1fr 5fr;
  }

  .glossary-buttons {
    top: var(--desktop-header-bar-height); /* Adjust this value for desktop header bar height */
    margin-left: 0
  }
}

</style>