<script setup lang="ts">
import { ref, computed, inject, onBeforeMount } from 'vue';
import { useRouter } from 'vue-router';
import { useMainNavigationStore } from '@/stores/main-navigation';
import i18next, { t } from 'i18next';
import type { ComputedRef } from 'vue';
import type { TaxonProfiles, TaxonProfile, Taxon, ImageWithTextAndLicence, Features } from 'localcosmos-client';
import { useLanguageStore } from '@/stores/language';
import type { TabButtonDefinition } from '@/types/navigation';
import ImageCarousel from '@/components/images/ImageCarousel.vue';
import TabbedPage from '@/components/container/TabbedPage.vue';
import GlossarizedText from '@/components/text/GlossarizedText.vue';
import TaxonTextsWithImages from '@/components/taxon-profiles/TaxonTextsWithImages.vue';
import ReadOnlyFilter from '@/components/taxon-profiles/traits/ReadOnlyFilter.vue';
import ColorStripe from '@/components/container/ColorStripe.vue';
import TaxonRelationship from '@/components/taxon-profiles/TaxonRelationship.vue';

const props = defineProps<{
  nameUuid:string|null
}>();

const router = useRouter();

const features = inject('features') as Features;
const taxonProfiles = inject('taxonProfiles') as TaxonProfiles;

const languageStore = useLanguageStore();
const mainNavigation = useMainNavigationStore();

const taxonProfile = ref<TaxonProfile | null>(null);
const hasTaxonRelationships = ref<boolean>(false);
const taxon = ref<Taxon | null>(null);
const vernacularName = ref<string|null>(null);
const title = ref<string>('');
const pending = ref<boolean>(true);

const images: ComputedRef<ImageWithTextAndLicence[]> = computed(() => {
  
  const images = [
    ...(taxonProfile.value?.images?.taxonProfileImages || []),
    ...(taxonProfile.value?.images?.nodeImages || []),
    ...(taxonProfile.value?.images?.taxonImages || []),
  ]

  return images;

});

const hasTexts = ref<boolean>(false);

// do not show an empty images tab
// the only tab that is shown when empty is the description tab
const tabButtons:TabButtonDefinition[] = [
  {
    tabIndex: 0,
    text: t('taxonProfiles.Profile'),
  },  
];

const initialTab = ref<number>(0);

const loadTaxonProfile = async (nameUuid: string) => {
  const data = await taxonProfiles.getLocalizedTaxonProfile(nameUuid, languageStore.currentLanguage);
  if (data) {

    if (data.vernacular && data.vernacular[i18next.language]) {
      vernacularName.value = data.vernacular[i18next.language];
      title.value = vernacularName.value;
    } else {
      title.value = `${data.taxonLatname} ${data.taxonAuthor}`;
    }

    taxon.value = {
      nameUuid: data.nameUuid,
      taxonSource: data.taxonSource,
      taxonLatname: data.taxonLatname,
      taxonAuthor: data.taxonAuthor,
      taxonNuid: data.taxonNuid,
    };

    taxonProfile.value = data;

    if (data.texts || data.categorizedTexts) {
      hasTexts.value = true;
    }

    pending.value = false;

    // check which buttons to display
    if (data.traits.length > 0) {
      tabButtons.push({ text: t('taxonProfiles.Traits'), tabIndex: 1 });
      
    }

    // related species, if any are tab 3
    // check for empty dictionary
    if (data.taxonRelationships && Object.keys(data.taxonRelationships).length > 0) {
      hasTaxonRelationships.value = true;
      tabButtons.push({ text: t('taxonProfiles.RelatedSpecies'), tabIndex: 3 });
    }

    if (features.GenericForm && features.GenericForm.list.length > 0) {
      tabButtons.push({ text: t('taxonProfiles.Observations'), tabIndex: 4 });
    }

  } else {
    router.replace({ name: 'not-found' });
  }
};


onBeforeMount(async () => {

  if (props.nameUuid) {
    await loadTaxonProfile(props.nameUuid);
  }
  mainNavigation.setCurrentPageTitle(title.value);
});
</script>

<template>
  <div class="min-h-full page-padding-y">
    <div v-if="pending" class="container page-padding-x">
      pending
    </div>
    <div v-else>
      <div class="container page-padding-x">
        <div class="taxon-profile-title">
          <h1 class="h1 pt-m">
            <span v-if=vernacularName>{{ vernacularName }}</span>
            <span v-else>
              <span v-if="taxon">
                <i>{{ taxon.taxonLatname }}</i> <span v-if=taxon.taxonAuthor>{{ taxon.taxonAuthor }}</span>
              </span>
            </span>
          </h1>
          <span v-if="vernacularName && taxon">
            <i>{{ taxon.taxonLatname }}</i> <span v-if=taxon.taxonAuthor>{{ taxon.taxonAuthor }}</span>
          </span>
        </div>
      </div>
      <TabbedPage
        id="taxon-profile"
        :tabs="tabButtons"
        :explode-on-large-screens="true"
        :initial-tab="initialTab"
      >
        <template #tab1>
          <div class="w-100">
            <div v-if="images.length" class="taxon-profile-images m-centered">
              <div class="carousel-container">
                <ImageCarousel
                  class="margin-bottom"
                  :images="images"
                />
              </div>
            </div>
            <div v-if="taxonProfile?.shortProfile" class="container page-padding-x pb-m">
              <GlossarizedText :html-text="taxonProfile.shortProfile" />
            </div>
            <div v-if="hasTexts">
              <ColorStripe
                v-if="taxonProfile?.texts"
                color="light"
                :only-on-large-screens="false"
                class="py-xxl"
              >
                <TaxonTextsWithImages :texts="taxonProfile.texts" />
              </ColorStripe>
              <template v-if="taxonProfile?.categorizedTexts">
                <ColorStripe
                  v-for="(categoryTexts, index) in taxonProfile.categorizedTexts"
                  :key="categoryTexts.category"
                  :color="index % 2 === 0 ? 'lighter' : 'light'"
                  :only-on-large-screens="false"
                  class="py-xxl"
                >
                  <div class="container page-padding-x">
                    <h1 class="mt-xl">{{ t(categoryTexts.category) }}</h1>
                  </div>
                  <TaxonTextsWithImages :texts="categoryTexts.texts" />
                </ColorStripe>
              </template>
            </div>
            <div v-else>
              {{ t('taxonProfiles.noDescription') }}
            </div>
          </div>
        </template>
        <template #tab2>
          <ColorStripe
            v-if="taxonProfile?.traits.length"
            color="none"
            :only-on-large-screens="true"
            class="py-xxl"
          >
            <div class="container page-padding-x">
              <h2>{{ t('taxonProfiles.Traits') }}</h2>
              <div class="trait-list">
                <div
                  v-for="trait in taxonProfile.traits"
                  :key="trait.matrixFilter.uuid"
                >
                  <ReadOnlyFilter
                    :filter="trait.matrixFilter"
                  />
                </div>
              </div>
            </div>
          </ColorStripe>
        </template>
        <template #tab3>
          <ColorStripe
            v-if="taxonProfile && hasTaxonRelationships"
            color="light"
            :only-on-large-screens="true"
            class="py-xxl"
          >
            <div class="container page-padding-x">
               <h2>{{ t('taxonProfiles.RelatedSpeciesTitle') }}</h2>
                <div
                  v-for="(typedRelationships, trIndex) in taxonProfile.taxonRelationships"
                  :key="trIndex"
                  class="mb-xxl"
                >
                  <h3 class="mb-m">{{ t(typedRelationships.relationshipType.name) }}</h3>
                  <div class="relationship-list">
                    <TaxonRelationship
                      v-for="(relationship, index) in typedRelationships.relationships"
                      :key="index"
                      :relationship="relationship"
                      :relationship-type="typedRelationships.relationshipType"
                      :taxon="taxon"
                    >
                    </TaxonRelationship>
                  </div>
                </div>
            </div>
          </ColorStripe>
        </template>
        <template #tab4>
          <ColorStripe
            v-if="features.GenericForm?.list.length"
            color="lighter"
            :only-on-large-screens="false"
            class="py-xxl"
          >
            <div class="container page-padding-x">
              <h2>{{ t('Observations') }}</h2>
            </div>
          </ColorStripe>
        </template>
      </TabbedPage>
    </div>
    
  </div>
</template>

<style scoped>
.taxon-profile-title {
  padding-bottom: var(--size-md);
}

.taxon-profile-images {
  padding: var(--size-xl) 0;
}

.taxon-texts {
  padding-bottom: var(--size-md);
}

.taxon-text {
  position: relative;
}

.taxon-profile-title {
  margin-bottom: var(--size-md);
}

.taxon-profile-tabs {
  margin-top: var(--size-md);
}

.trait-list {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: var(--size-md);
}

.relationship-list {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: var(--size-md);
}

@media (min-width: 640px) {
}

@media (min-width: 768px) {
}

@media (min-width: 1024px) {
  .relationship-list {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1280px) {
  .relationship-list {
    grid-template-columns: repeat(3, 1fr);
  }

}

@media (min-width: 1536px) {
}

</style>