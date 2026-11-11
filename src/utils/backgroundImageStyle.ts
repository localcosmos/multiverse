import type { TemplateContentSource } from '@/composables/useTemplateContent';

export function backgroundImageStyle(
  imagePath: string | null,
  source: TemplateContentSource | null,
  templateContentImageUrl: (imageUrl: string, source: TemplateContentSource | null) => string
): Record<string, string> {
  if (!imagePath) {
    return {
      '--article-image-fallback': 'none',
      '--article-image-set': 'none'
    };
  }

  const imageUrl = templateContentImageUrl(imagePath, source);

  return {
    '--article-image-fallback': `url("${imageUrl}")`,
    '--article-image-set': `url("${imageUrl}")`
  };
}
