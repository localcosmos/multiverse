import type { FrontendSettings, ImageUrls } from "localcosmos-client";
import { inject } from 'vue';

export function imageUrlsToSrcSet (imageUrls: ImageUrls): string {
  const settings = inject('settings') as FrontendSettings;
  
  let srcset = `${imageUrls['1x']} 250w, ${imageUrls['2x']} 500w, ${imageUrls['4x']}, 1000w`;

  if (settings.OPTIONS.doNotBuildLargeImages === true) {
    srcset = `${imageUrls['1x']} 250w, ${imageUrls['2x']} 500w`;
  }
  return srcset;
}
