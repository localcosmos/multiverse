<script setup lang="ts">
import { computed, ref, inject, onBeforeMount } from 'vue';
import type { GenericFormField, ReadOnlyDataset, BackboneTaxonomy, Taxon, TaxonProfiles } from 'localcosmos-client';
import { GenericFormFieldType } from 'localcosmos-client';
import { t } from 'i18next';
import LocalDate from '@/components/ui/LocalDate.vue';

import ImageCarousel from '@/components/images/ImageCarousel.vue';

//import { getUploadedImageLicence } from '@/composables/getUploadedImageLicence';

const backboneTaxonomy = inject('backboneTaxonomy') as BackboneTaxonomy;
const taxonProfiles = inject('taxonProfiles') as TaxonProfiles;

const props = defineProps<{
  field: GenericFormField,
  dataset: ReadOnlyDataset,
}>();

const unparsedValue = ref(props.dataset.data[props.field.uuid]);
const hasTaxonProfile = ref<boolean>(false);

const getTaxonFieldValue = (taxon: Taxon) => {
  let name = backboneTaxonomy.vernacular(taxon.nameUuid);
  if (!name) {
    name = t(taxon.taxonLatname);
  }

  return name;
};

const parseFormValue = (value: any) => {
  switch (props.field.fieldClass) {
    case GenericFormFieldType.SelectTaxonField:
    case GenericFormFieldType.TaxonField:
      return getTaxonFieldValue(value);
    case GenericFormFieldType.DateTimeJSONField:
      return new Date(props.dataset.timestamp).toISOString();
    case GenericFormFieldType.PointJSONField:
      return `${value.geometry.coordinates[0]}N ${value.geometry.coordinates[1]}E`;
    default:
      return value;
  }
};

const stringValue = computed(() => {
  if (props.field.uuid in props.dataset.data) {
    const value = props.dataset.data[props.field.uuid];
    return parseFormValue(value);
  }

  return '-';
});

const images = computed(() => {
  if (props.field.uuid in props.dataset.images) {
    return props.dataset.images[props.field.uuid];
  }

  return [];
});

const fieldSpecificClass = computed(() => {
  return `read-only-${props.field.fieldClass}`;
});


const imageLicence = computed(() => {
  if (props.dataset.user) {

    //const licence = getUploadedImageLicence(props.dataset.user);
    //return licence;
  }
  return null;
});

onBeforeMount(async () => {
  if (props.field.fieldClass === GenericFormFieldType.SelectTaxonField || props.field.fieldClass === GenericFormFieldType.TaxonField) {
    
    if (props.field.uuid in props.dataset.data) {
      const taxon = props.dataset.data[props.field.uuid] as Taxon;
      const data = await taxonProfiles.getTaxonProfile(taxon.nameUuid);
      if (data) {
        hasTaxonProfile.value = true;
      }
    }
  }
});

</script>

<template>
  <div
    class="read-only-field"
    :class="fieldSpecificClass"
  >
    <div
      class="read-only-field-label"
    >
      {{ $t(props.field.definition.label) }}:
    </div>
    <div
      v-if="props.field.fieldClass === GenericFormFieldType.PictureField"
      class="observation-images"
    >
      <ImageCarousel
        v-if="images.length > 0"
        :images="images"
      />
      <div v-else>
        -
      </div>
    </div>
    <div
      v-else
      class="field-row"
    >
      <div v-if="field.fieldClass === GenericFormFieldType.DateTimeJSONField">
        <LocalDate :date="stringValue" />
      </div>
      <div v-else-if="field.fieldClass === GenericFormFieldType.TaxonField">
        <RouterLink v-if="hasTaxonProfile"
          :to="{ name: 'taxon-profile-nameuuid', params: { nameUuid: unparsedValue.nameUuid } }"
          class="text-primary"
        >
          {{ stringValue }}
        </RouterLink>
        <div v-else>
          {{ stringValue }}
        </div>
      </div>
      <div
        v-else
        class="field-text"
      >
        {{ stringValue }}
      </div>
      <span v-if="stringValue !== '-' && field.definition.unit">
        {{ field.definition.unit }}
      </span>
    </div>
  </div>
</template>

<style scoped>

.read-only-field {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  gap: var(--gap-medium);
}

.read-only-PictureField {
  display: grid;
  grid-template-rows: auto auto;
  grid-template-columns: 100%;
  width: 100%;
}

.field-row {
  display: flex;
  gap: .2rem;
}
.read-only-SelectTaxonField .read-only-field-label {
  font-style: italic;
}

.read-only-field-label {
}

.observation-images {
  
}
.observation-image {
  background-size: cover;
  width: 100%;
  aspect-ratio: 1/1;
  margin-top: 1rem;
  justify-self: center;
}

.observation-image-licence-circle {
  position: absolute;
  left: -4px;
  bottom: -4px;
}

@media (min-width: 550px) {
  .observation-images {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 640px) {}

@media (min-width: 768px) {
  .observation-images {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (min-width: 1024px) {
  .observation-images {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 1280px) {
  .observation-images {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (min-width: 1536px) {}
</style>
