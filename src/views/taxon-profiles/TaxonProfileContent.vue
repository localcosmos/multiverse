<script setup lang="ts">
import { ref, computed, inject, onBeforeMount, watch } from "vue";
import { useRouter } from "vue-router";
import { useMainNavigationStore } from "@/stores/main-navigation";
import i18next, { t } from "i18next";
import type { ComputedRef } from "vue";
import type {
  TaxonProfiles,
  TaxonProfile,
  Taxon,
  ImageWithTextAndLicence,
  Features,
} from "localcosmos-client";
import { useLanguageStore } from "@/stores/language";
import { useTabsStore } from "@/stores/tabs";
import type { TabButtonDefinition } from "@/types/navigation";
import { TabButtonType } from "@/types/navigation";
import type { TemplateContentPreviewData } from "@/types/template-content";

import ImageCarousel from "@/components/images/ImageCarousel.vue";
import TabbedPage from "@/components/container/TabbedPage.vue";
import GlossarizedText from "@/components/text/GlossarizedText.vue";
import TaxonTextsWithImages from "@/components/taxon-profiles/TaxonTextsWithImages.vue";
import ReadOnlyFilter from "@/components/taxon-profiles/traits/ReadOnlyFilter.vue";
import TaxonRelationship from "@/components/taxon-profiles/TaxonRelationship.vue";
import LargeCard from "@/components/container/LargeCard.vue";
import TemplateContentPreview from "@/components/template-content/TemplateContentPreview.vue";
import ImageCard from "@/components/ui/ImageCard.vue";
import ExternalMediaResolver from "@/components/external-media/ExternalMediaResolver.vue";

import { useTemplateContent } from "@/composables/useTemplateContent";
import TaxonProfileLink from "@/components/ui/TaxonProfileLink.vue";

const props = defineProps<{
  nameUuid: string | null;
  morphotype?: string | null;
}>();

const router = useRouter();

const features = inject("features") as Features;
const taxonProfiles = inject("taxonProfiles") as TaxonProfiles;

const languageStore = useLanguageStore();

const { fetchTemplateContent } = useTemplateContent();
const mainNavigation = useMainNavigationStore();

const taxonProfile = ref<TaxonProfile | null>(null);
const otherVernacularNames = ref<Record<string, string>>({});
const hasTaxonRelationships = ref<boolean>(false);
const templateContentLinks = ref<TemplateContentPreviewData[]>([]);
const taxon = ref<Taxon | null>(null);
const vernacularName = ref<string | null>(null);
const title = ref<string>("");
const pending = ref<boolean>(true);

const AVAILABLE_FLAG_CODES = new Set(["da", "de", "dk", "gb", "nl"]);
const FLAG_CODE_BY_LANGUAGE: Record<string, string> = {
  en: "gb",
};

const getFlagCode = (lang: string): string => {
  const normalizedLang = lang.toLowerCase().split("-")[0];
  const mappedCode = FLAG_CODE_BY_LANGUAGE[normalizedLang] || normalizedLang;

  return AVAILABLE_FLAG_CODES.has(mappedCode) ? mappedCode : "gb";
};

const images: ComputedRef<ImageWithTextAndLicence[]> = computed(() => {
  // do not include taxonImages for morphotypes, as these are the same as for the main taxon profile and can be confusing when shown in the morphotype profile
  const images = [
    ...(taxonProfile.value?.images?.taxonProfileImages || []),
    ...(taxonProfile.value?.images?.nodeImages || []),
    ...(taxonProfile.value?.images?.taxonImages || []),
  ];

  return images;
});

const hasTexts = ref<boolean>(false);

// do not show an empty images tab
// the only tab that is shown when empty is the description tab
const tabButtons: TabButtonDefinition[] = [
  {
    tabIndex: 1,
    text: t("taxonProfiles.Profile"),
    type: TabButtonType.STANDARD,
  },
];

const initialTab = ref<number>(1);

const loadTaxonProfile = async (nameUuid: string) => {
  const tabsStore = useTabsStore();
  tabsStore.setActiveTab("taxon-profile", 1);

  let data: TaxonProfile | null = null;

  if (props.morphotype) {
    data = await taxonProfiles.getLocalizedMorphotypeProfile(
      nameUuid,
      props.morphotype,
      languageStore.currentLanguage,
    );
  } else {
    data = await taxonProfiles.getLocalizedTaxonProfile(
      nameUuid,
      languageStore.currentLanguage,
    );
  }

  if (data) {
    // console.log('Loaded taxon profile data:', data);

    if (data.vernacular && data.vernacular[i18next.language]) {
      vernacularName.value = data.vernacular[i18next.language];
      title.value = vernacularName.value;
    } else {
      title.value = `${data.taxonLatname} ${data.taxonAuthor}`;
    }

    const currentVernacular = data.vernacular?.[i18next.language] ?? null;
    otherVernacularNames.value = Object.fromEntries(
      Object.entries(data.vernacular || {}).filter(
        ([, name]) => name !== currentVernacular,
      ),
    );

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
      tabButtons.push({
        text: t("taxonProfiles.Traits"),
        tabIndex: 2,
        type: TabButtonType.STANDARD,
      });
    }

    // related species, if any are tab 3
    // check for empty dictionary
    if (
      data.taxonRelationships &&
      Object.keys(data.taxonRelationships).length > 0
    ) {
      hasTaxonRelationships.value = true;
      tabButtons.push({
        text: t("taxonProfiles.RelatedSpecies"),
        tabIndex: 3,
        type: TabButtonType.STANDARD,
      });
    }

    if (data.externalMedia && data.externalMedia.length > 0) {
      tabButtons.push({
        text: t("taxonProfiles.ExternalMedia"),
        tabIndex: 4,
        type: TabButtonType.STANDARD,
      });
    }

    if (features.GenericForm && features.GenericForm.list.length > 0) {
      tabButtons.push({
        text: t("taxonProfiles.Observations"),
        tabIndex: 5,
        type: TabButtonType.STANDARD,
      });
    }

    if (data.templateContents && data.templateContents.length > 0) {
      tabButtons.push({
        text: t("taxonProfiles.TemplateContents"),
        tabIndex: 6,
        type: TabButtonType.STANDARD,
      });
      // prepare template content links
      data.templateContents.forEach(async (tc) => {
        const tcResult = await fetchTemplateContent(tc.slug);
        if (tcResult.templateData) {
          const previewData: TemplateContentPreviewData = {
            title: tcResult.templateData.title,
            templateName: tcResult.templateData.templateName,
            slug: tc.slug,
            previewImage: tcResult.templateData.previewImage
              ? tcResult.templateData.previewImage
              : null,
            featuredImage: tcResult.templateData.featuredImage
              ? tcResult.templateData.featuredImage
              : null,
            abstract: tcResult.templateData.abstract
              ? tcResult.templateData.abstract
              : null,
          };
          templateContentLinks.value.push(previewData);
        }
      });
    }

    // Sort tabs by tabIndex to ensure correct order
    tabButtons.sort((a, b) => a.tabIndex - b.tabIndex);
  } else {
    router.replace({ name: "not-found" });
  }
};

onBeforeMount(async () => {
  if (props.nameUuid) {
    await loadTaxonProfile(props.nameUuid);
  }
  mainNavigation.setCurrentPageTitle(title.value);
});

watch(
  () => props.nameUuid,
  async (newNameUuid) => {
    if (newNameUuid) {
      await loadTaxonProfile(newNameUuid);
    }
  },
);
</script>

<template>
  <div class="taxon-profile-content min-h-full">
    <div v-if="pending" class="container page-padding-x">pending</div>
    <div v-else>
      <div
        class="container md-title-header-padding-top"
        :class="{
          'subheader-padding-top': tabButtons.length > 1,
          'header-padding-top': tabButtons.length <= 1,
        }"
      >
        <LargeCard class="content-padding-y">
          <TabbedPage
            id="taxon-profile"
            :tabs="tabButtons"
            :explode-on-large-screens="false"
            :show-nav-on-large-screens="true"
            :initial-tab="initialTab"
            class="page-padding-bottom"
          >
            <template #tab1>
              <div class="w-100">
                <div class="container-md pb-sm page-padding-x">
                  <div class="taxon-profile-content__title">
                    <h1 class="h1">
                      <span v-if="vernacularName">{{ vernacularName }}</span>
                      <span v-else>
                        <span v-if="taxon">
                          <i>{{ taxon.taxonLatname }}</i>
                          <span v-if="taxon.taxonAuthor">
                            {{ taxon.taxonAuthor }}</span
                          >
                        </span>
                      </span>
                      <span v-if="taxonProfile?.morphotype">
                        ({{ taxonProfile.morphotype }})</span
                      >
                    </h1>
                    <span v-if="vernacularName && taxon">
                      <i>{{ taxon.taxonLatname }}</i>
                      <span v-if="taxon.taxonAuthor">{{
                        taxon.taxonAuthor
                      }}</span>
                    </span>
                  </div>
                </div>
                <div
                  v-if="images.length"
                  class="taxon-profile-content__images m-centered"
                >
                  <div class="w-100">
                    <ImageCarousel :images="images" :safe-center="true" />
                  </div>
                </div>

                <div
                  v-if="taxonProfile?.shortProfile"
                  class="container-md py-xl page-padding-x text-justify"
                >
                  <GlossarizedText :html-text="taxonProfile.shortProfile" />
                </div>

                <div v-if="hasTexts" class="container-md">
                  <div
                    v-if="taxonProfile?.texts"
                    color="light"
                    :only-on-large-screens="false"
                    class="pb-2xl"
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
                      class="pb-2xl"
                    >
                      <div class="page-padding-x">
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
                  {{ t("taxonProfiles.noDescription") }}
                </div>
                <div
                  v-if="taxonProfile?.morphotypeProfiles.length"
                  class="container-md page-padding-x"
                >
                  <div>
                    <h1>{{ t("taxonProfiles.Morphotypes") }}</h1>
                    <div class="taxon-profile-content__morphotypes-list mt-xl">
                      <div
                        v-for="morphotype in taxonProfile.morphotypeProfiles"
                        :key="morphotype.taxonProfileId"
                      >
                        <TaxonProfileLink
                          :taxon="morphotype.taxon"
                          :morphotype="morphotype.morphotype"
                          class="nolinkstyle"
                        >
                          <ImageCard :image="morphotype.image">
                            <strong>{{ morphotype.morphotype }}</strong>
                          </ImageCard>
                        </TaxonProfileLink>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </template>
            <template #tab2>
              <div
                v-if="taxonProfile?.traits.length"
                class="container-md page-padding-x"
              >
                <div class="pb-2xl">
                  <div class="taxon-profile-content__title">
                    <h1>{{ t("taxonProfiles.Traits") }}</h1>
                  </div>
                  <div class="taxon-profile-content__trait-list mt-xl">
                    <div
                      v-for="trait in taxonProfile.traits"
                      :key="trait.matrixFilter.uuid"
                    >
                      <ReadOnlyFilter :filter="trait.matrixFilter" />
                    </div>
                  </div>
                </div>
              </div>
            </template>
            <template #tab3>
              <div
                v-if="taxonProfile && hasTaxonRelationships"
                class="container-md page-padding-x"
              >
                <div class="pb-2xl">
                  <div class="taxon-profile-content__title">
                    <h1>{{ t("taxonProfiles.RelatedSpeciesTitle") }}</h1>
                  </div>
                  <div
                    v-for="(
                      typedRelationships, trIndex
                    ) in taxonProfile.taxonRelationships"
                    :key="trIndex"
                    class="mt-xl mb-2xl"
                  >
                    <h2 class="mb-m">
                      {{ t(typedRelationships.relationshipType.name) }}
                    </h2>
                    <div class="taxon-profile-content__relationship-list">
                      <TaxonRelationship
                        v-for="(
                          relationship, index
                        ) in typedRelationships.relationships"
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
                class="container-md page-padding-x"
              >
                <div class="pb-2xl">
                  <div class="taxon-profile-content__title">
                    <h1>{{ t("Observations") }}</h1>
                  </div>
                </div>
              </div>
            </template>
            <template #tab5>
              <div
                v-if="taxonProfile?.templateContents?.length"
                class="container-md page-padding-x"
              >
                <div class="pb-2xl">
                  <div class="taxon-profile-content__title">
                    <h1>{{ t("taxonProfiles.TemplateContents") }}</h1>
                  </div>
                  <div class="mt-xl">
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

<style>
.taxon-profile-content__title {
  margin-top: 50px;
  padding-bottom: 50px;
  margin-bottom: var(--size-md);
}

.taxon-profile-content__images {
  padding: 0;
}

.taxon-profile-content__texts {
  padding-bottom: var(--size-md);
}

.taxon-profile-content__text {
  position: relative;
}

.taxon-profile-content__title {
  margin-bottom: var(--size-md);
}

.taxon-profile-content__tabs {
  margin-top: var(--size-md);
}

.taxon-profile-content__trait-list {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  flex-wrap: wrap;
  gap: var(--size-md);
  row-gap: var(--size-2xl);
}

.taxon-profile-content__relationship-list {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: var(--size-md);
}

.taxon-profile-content__external-media-list {
  display: grid;
  gap: var(--size-md);
}

.taxon-profile-content__morphotypes-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--size-md);
}

@media (min-width: 640px) {
}

@media (min-width: 768px) {
  .taxon-profile-content__trait-list {
    grid-template-columns: repeat(2, 1fr);
  }

  .taxon-profile-content__morphotypes-list {
    grid-template-columns: repeat(3, 1fr);
  }

  .taxon-profile-content__external-media-list {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .taxon-profile-content__relationship-list {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1280px) {
  .taxon-profile-content__relationship-list {
    grid-template-columns: repeat(2, 2fr);
  }
}

@media (min-width: 1536px) {
}
</style>
