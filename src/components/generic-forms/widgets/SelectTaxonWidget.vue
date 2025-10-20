<script setup lang="ts">
import { inject } from 'vue';
import type { TaxonType, GenericFormField, BackboneTaxonomy, TaxonProfiles } from 'localcosmos-client';
import { useField } from 'vee-validate';
import { createGenericFieldLabel } from '@/composables/createGenericFieldLabel';
import fallBackProfilePicture from '@/assets/images/no-image.svg';
import { useLanguageStore } from '@/stores/language';
import { PhBinoculars } from '@phosphor-icons/vue';

interface RadioButton {
  value: string,
  name: string,
  imageUrl: string | null,
}

const taxonProfiles = inject('taxonProfiles') as TaxonProfiles;
const languageStore = useLanguageStore();

const props = defineProps<{
  genericField: GenericFormField
}>();

const { value, errorMessage } = useField(() => props.genericField.uuid);
const label = createGenericFieldLabel(props.genericField);
const radioButtons: RadioButton[] = [];

props.genericField.taxonomicRestrictions.forEach((taxonForRestriction) => {
  let name = taxonForRestriction.taxonLatname;
  let imageUrl = fallBackProfilePicture;

  const profile = taxonProfiles.getRegisteredTaxon(taxonForRestriction.nameUuid);

  if (profile) {
    if (profile.image) {
      imageUrl = profile.image.imageUrl['2x'];
    }
    
    if (languageStore.currentLanguage in profile.vernacularNames) {
      name = profile.vernacularNames[languageStore.currentLanguage];
    }
  }

  const radioButton = {
    value: taxonForRestriction.nameUuid,
    name: name,
    imageUrl: imageUrl,
  } as RadioButton;

  radioButtons.push(radioButton);
});

</script>

<template>
  <div
    class="select-taxon-widget mb-xl"
    :class="(errorMessage && errorMessage.length) ? 'has-error' : ''"
  >
    <div class="form-field-icon">
      <PhBinoculars
        size="22"
      />
    </div>
    <div>
      <div class="form-field-label mb-md">
        {{ label }} <span v-if="errorMessage && errorMessage.length"> - {{ errorMessage }}</span>
      </div>
      <div class="taxon-selection">
        <div
          v-for="radio in radioButtons"
          :key="radio.value"
        >
          <label
            :for="`${genericField.uuid}-${radio.value}`"
            class="taxon-item"
          >
            <input
              :id="`${genericField.uuid}-${radio.value}`"
              type="radio"
              v-model="value"
              :value="radio.value"
              :name="genericField.uuid"
              class="taxon-radio"
            >
            <div
              class="taxon-image"
              :style="`background-image:url(${radio.imageUrl})`"
            >
            </div>
            <div class="taxon-name">
              <span>{{ radio.name }}</span>
            </div>
          </label>
        </div>
      </div>
      <div
        class="help-text"
      >
        <span v-if="genericField.definition.helpText">
          {{ $t(genericField.definition.helpText) }}
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.has-error .select-taxon-label {
  color: var(--color-error);
}

.select-taxon-widget {
  display: grid;
  grid-template-columns: 40px auto;
  grid-template-rows: auto auto;
  grid-template-areas: 'icon field';
}

.taxon-selection {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: var(--gap-medium);
  row-gap: var(--gap-medium);
  align-items: center;
  justify-content: center;
}

.taxon-selection  > div {
  width: calc(50% - ( var(--gap-medium) / 2 ));
}

.taxon-item {
  position: relative;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border-radius: var(--border-radius);
  font-size: .9rem;
}

.taxon-image {
  width: 100%;
  aspect-ratio: 1/1;
  box-shadow: var(--box-shadow);
  border-radius: var(--border-radius);
  border: 5px solid white;
  background-size: contain;
}

.taxon-item input:checked ~ .taxon-image {
  box-shadow: var(--box-shadow-active);
  border: 5px solid var(--color-success);
}

.taxon-radio {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

.taxon-name {
  text-align: center;
  padding: 4px 0 0 0;
}

@media (min-width: 576px) {
  .taxon-selection  > div {
    width: calc(33% - ( var(--gap-medium) ));
  }
}

@media (min-width: 768px) {
  .taxon-selection {
    justify-content: flex-start;
  }
  .taxon-selection  > div {
    width: calc(25% - ( var (--gap-medium)));
  }
}

@media (min-width: 1024px) {
  .taxon-selection  > div {
    width: calc(20% - ( var(--gap-medium) ));
  }
}
</style>