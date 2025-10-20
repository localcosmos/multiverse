import { inject } from "vue";
import type { Features, LocalCosmosApi, Page } from 'localcosmos-client';
import { LCApiResultTypes } from 'localcosmos-client';


export async function fetchTemplateContent (slug: string): Promise<Page | null> {

  const isInPreviewMode = inject('isInPreviewMode') as boolean;
  const features = inject('features') as Features;
  const LCApi = inject('LCApi') as LocalCosmosApi

  let templateData: Page| null = null;

  if (isInPreviewMode === true) {
    const result = await LCApi.getTemplateContentPreview(slug);
    if (result.type === LCApiResultTypes.success) {
      const page = result.data as Page;
      templateData = page;
    }
  }
  else {
    if (features && features.TemplateContent && features.TemplateContent.slugs && features.TemplateContent.slugs[slug]) {
      const url = features.TemplateContent.slugs[slug].path;
      const response = await fetch(url);
      const page = await response.json() as Page;
      templateData = page;
      console.log('Fetched template content from', url, templateData);
    }
  }

  return templateData;
}