import { inject } from "vue";
import type { Features, LocalCosmosApi } from 'localcosmos-client';
import { LCApiResultTypes } from 'localcosmos-client';
import type { MultiversePage } from '@/types/template-content';
import { useNetworkInformationStore } from '@/stores/network-information';


/**
 * Fetches the template content for a given slug.
 * @param slug - The slug of the template content to fetch.
 * @returns A promise that resolves to the template content or null if not found.
 * If the navigator has an internet connection, try to fetch the most recent version from the api. If the navigator is offline, try to fetch the content from the features object.
 */
export async function fetchTemplateContent (slug: string): Promise<MultiversePage | null> {

  const isInPreviewMode = inject('isInPreviewMode') as boolean;
  const features = inject('features') as Features;
  const LCApi = inject('LCApi') as LocalCosmosApi
  const networkInformationStore = useNetworkInformationStore();
  const isOnline = networkInformationStore.isOnline;

  let templateData: MultiversePage | null = null;

  if (isInPreviewMode === true) {
    const result = await LCApi.getTemplateContentPreview(slug);
    if (result.type === LCApiResultTypes.success) {
      templateData = result.data as MultiversePage;
    }
  }
  else {
    if (features && features.TemplateContent && features.TemplateContent.slugs && features.TemplateContent.slugs[slug]) {

      let remotePage: MultiversePage | null = null;

      if (isOnline) {
        const response = await LCApi.getTemplateContent(slug);
        if (response.type === LCApiResultTypes.success) {
          remotePage = response.data as MultiversePage;
        }

      }

      const url = features.TemplateContent.slugs[slug].path;
      const response = await fetch(url);
      const page = await response.json() as MultiversePage;

      if (remotePage && remotePage.version > page.version) {
        templateData = remotePage;
        console.debug('Fetched template content from API', url, templateData);
      }
       else {
        templateData = page;
        console.debug('Fetched template content from features', url, templateData);
      }
    }
  }

  return templateData;
}