<script setup lang="ts">
import { t } from "i18next";

const props = defineProps<{
  taxonLatname: string;
  taxonAuthor?: string | null;
  vernacularName?: string | null;
  singleLine?: boolean;
  hideTaxonAuthor?: boolean;
  hideScientificName?: boolean;
  morphotype?: string;
  narrow?: boolean;
  fontFamily?: string;
  fontSize?: string;
}>();

let scientificName: string = props.taxonLatname;
let fontFamily = props.fontFamily || "var(--font-family-taxon-name)";
let fontSize = props.fontSize || "var(--font-size-taxon-name)";

if (props.taxonAuthor) {
  scientificName = `${props.taxonLatname} ${props.taxonAuthor}`;
}
let usedVernacularName: string | null = t(scientificName);

if (props.vernacularName) {
  usedVernacularName = props.vernacularName;
} else if (usedVernacularName.indexOf(props.taxonLatname) == 0) {
  usedVernacularName = null;
}

if (usedVernacularName && props.morphotype) {
  usedVernacularName = `${usedVernacularName} (${props.morphotype})`;
}
</script>

<template>
  <div class="taxon-name">
    <div
      class="taxon-name__container"
      :class="{
        'taxon-name__container--single-line': singleLine,
        'taxon-name__container--narrow': narrow,
      }"
    >
      <span
        v-if="usedVernacularName"
        class="taxon-name__primary"
        :style="{ fontFamily: fontFamily, fontSize: fontSize }"
      >
        {{ usedVernacularName }}
      </span>
      <span
        v-else
        class="taxon-name__primary--alternative"
        :style="{ fontFamily: fontFamily, fontSize: fontSize }"
      >
        <i>{{ taxonLatname }}</i> <br />
        <span v-if="taxonAuthor" class="taxon-name__scientific">{{
          taxonAuthor
        }}</span>
        <span v-if="props.morphotype" class="taxon-name__morphotype"
          >({{ props.morphotype }})</span
        >
      </span>
    </div>
    <div
      v-if="usedVernacularName && !hideScientificName"
      class="taxon-name__scientific taxon-name__scientific--secondary"
      :class="singleLine ? 'taxon-name__scientific--single-line' : ''"
    >
      <i>{{ taxonLatname }}</i> <span v-if="!hideTaxonAuthor">{{ taxonAuthor }}</span>
    </div>
  </div>
</template>

<style>
.taxon-name__container--narrow {
  font-family: var(--font-family-tight);
}

.taxon-name__primary {
  font-weight: bold;
}

.taxon-name__scientific {
  font-size: 16px;
}

.taxon-name__scientific--secondary {
  font-size: 12px;
  color: rgb(150, 150, 150);
}

.taxon-name__container--single-line,
.taxon-name__scientific--single-line {
  white-space: nowrap; /* Prevent text wrapping */
  overflow: hidden; /* Hide overflowing text */
  text-overflow: ellipsis; /* Add ellipsis for truncated text */
  vertical-align: middle; /* Align text vertically */
}
</style>
