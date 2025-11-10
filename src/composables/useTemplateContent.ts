import { inject } from 'vue';
import type { Features, LocalCosmosApi } from 'localcosmos-client';
import { LCApiResultTypes } from 'localcosmos-client';
import type { MultiversePage } from '@/types/template-content';

export function useTemplateContent() {
  const isInPreviewMode = inject('isInPreviewMode') as boolean;
  const features = inject('features') as Features;
  const LCApi = inject('LCApi') as LocalCosmosApi;

  const fetchTemplateContent = async (slug: string): Promise<MultiversePage | null> => {
    let templateData: MultiversePage | null = null;

    if (isInPreviewMode) {
      const result = await LCApi.getTemplateContentPreview(slug);
      if (result.type === LCApiResultTypes.success) {
        templateData = result.data as MultiversePage;
      }
    } else {
      if (features?.TemplateContent?.slugs?.[slug]) {
        const url = features.TemplateContent.slugs[slug].path;
        const response = await fetch(url);
        templateData = await response.json() as MultiversePage;
      }
    }

    return templateData;
  };

  return {
    fetchTemplateContent
  };
}