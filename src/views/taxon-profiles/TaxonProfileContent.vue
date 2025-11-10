<script setup lang="ts">
import { ref, computed, inject, onBeforeMount } from 'vue';
import { useRouter } from 'vue-router';
import { useMainNavigationStore } from '@/stores/main-navigation';
import i18next, { t } from 'i18next';
import type { ComputedRef } from 'vue';
import type { TaxonProfiles, TaxonProfile, Taxon, ImageWithTextAndLicence, Features } from 'localcosmos-client';
import { useLanguageStore } from '@/stores/language';
import type { TabButtonDefinition } from '@/types/navigation';
import type { TemplateContentPreviewData } from '@/types/template-content';
import ImageCarousel from '@/components/images/ImageCarousel.vue';
import TabbedPage from '@/components/container/TabbedPage.vue';
import GlossarizedText from '@/components/text/GlossarizedText.vue';
import TaxonTextsWithImages from '@/components/taxon-profiles/TaxonTextsWithImages.vue';
import ReadOnlyFilter from '@/components/taxon-profiles/traits/ReadOnlyFilter.vue';
import TaxonRelationship from '@/components/taxon-profiles/TaxonRelationship.vue';
import LargeCard from '@/components/container/LargeCard.vue';
import TemplateContentPreview from '@/components/template-content/TemplateContentPreview.vue';

import { useTemplateContent } from '@/composables/useTemplateContent';

const props = defineProps<{
  nameUuid:string|null
}>();

const router = useRouter();

const features = inject('features') as Features;
const taxonProfiles = inject('taxonProfiles') as TaxonProfiles;

const languageStore = useLanguageStore();

const { fetchTemplateContent } = useTemplateContent();
const mainNavigation = useMainNavigationStore();

const taxonProfile = ref<TaxonProfile | null>(null);
const hasTaxonRelationships = ref<boolean>(false);
const templateContentLinks = ref<TemplateContentPreviewData[]>([]);
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

    console.log('Loaded taxon profile data:', data);

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

    if (data.templateContents && data.templateContents.length > 0) {
      tabButtons.push({ text: t('taxonProfiles.TemplateContents'), tabIndex: 5 });

      // prepare template content links
      data.templateContents.forEach( async (tc) => {
        const tcData = await fetchTemplateContent(tc.slug);
        if (tcData) {
          const previewData: TemplateContentPreviewData = {
            title: tcData.title,
            templateName: tcData.templateName,
            slug: tc.slug,
            previewImage: tcData.previewImage ? tcData.previewImage : null,
            featuredImage: tcData.featuredImage ? tcData.featuredImage : null,
            abstract: tcData.abstract ? tcData.abstract : null,
          };
          templateContentLinks.value.push(previewData);
        }
      });
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
      <div class="container">   
        <LargeCard>
          <div class="container-md pt-xxl pb-sm sm-page-padding-x">
            <div class="taxon-profile-title">
              <h1 class="h1 pt-xxl">
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
            :show-nav-on-large-screens="true"
            :initial-tab="initialTab"
          >
            <template #tab1>
              <div class="w-100">
                <div v-if="images.length" class="taxon-profile-images m-centered">
                  <div class="w-100 mt-xl">
                    <ImageCarousel
                      :images="images"
                      :safe-center="true"
                    />
                  </div>
                </div>
                
                <div
                  v-if="taxonProfile?.shortProfile"
                  class="container-md py-xxl sm-page-padding-x text-justify"
                >
                  <GlossarizedText :html-text="taxonProfile.shortProfile" />
                </div>
                
                <div
                  v-if="hasTexts"
                  class="container-md sm-page-padding-x"
                >
                  <div
                    v-if="taxonProfile?.texts"
                    color="light"
                    :only-on-large-screens="false"
                    class="pb-xxl"
                  >
                    <TaxonTextsWithImages
                      :texts="taxonProfile.texts"
                      :small-images="true"
                    />
                  </div>
                  <template v-if="taxonProfile?.categorizedTexts">
                    <div
                      v-for="categoryTexts in taxonProfile.categorizedTexts"
                      :key="categoryTexts.category"
                      :only-on-large-screens="false"
                      class="pb-xxl"
                    >
                      <div>
                        <h1 class="mt-xl">{{ t(categoryTexts.category) }}</h1>
                      </div>
                      <TaxonTextsWithImages
                        :texts="categoryTexts.texts"
                        :small-images="true"
                      />
                    </div>
                  </template>
                </div>
                <div v-else>
                  {{ t('taxonProfiles.noDescription') }}
                </div>
              </div>
            </template>
            <template #tab2>
              <div
                v-if="taxonProfile?.traits.length"
                class="container-md sm-page-padding-x"
              >
                <div class="py-xxl">
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
              </div>
            </template>
            <template #tab3>
              <div
                v-if="taxonProfile && hasTaxonRelationships"
                class="container-md sm-page-padding-x"
              >
                <div class="py-xxl">
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
              </div>
            </template>
            <template #tab4>
              <div
                v-if="features.GenericForm?.list.length"
                class="container-md sm-page-padding-x"
              >
                <div class="py-xxl">
                  <h2>{{ t('Observations') }}</h2>
                </div>
              </div>
            </template>
            <template #tab5>
              <div
                v-if="taxonProfile?.templateContents?.length"
                class="container-md sm-page-padding-x"
              >
                <div class="py-xxl">
                  <h2>{{ t('taxonProfiles.TemplateContents') }}</h2>
                  <div>
                    <TemplateContentPreview
                      v-for="(tcLink, index) in templateContentLinks"
                      :key="index"
                      :preview-data="tcLink"
                    />
                  </div>
                </div>
              </div>
            </template>
          </TabbedPage>
        </LargeCard>
      </div>      
    </div>
  </div>
</template>

<style scoped>
.taxon-profile-title {
  padding-bottom: var(--size-md);
}

.taxon-profile-images {
  padding: 0;
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