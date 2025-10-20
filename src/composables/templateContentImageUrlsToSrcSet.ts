import type { FrontendSettings, ImageUrls } from "localcosmos-client";
import { inject } from 'vue';

export function templateContentImageUrlsToSrcSet (imageUrls: ImageUrls): string {
  const settings = inject('settings') as FrontendSettings;

  let serverUrl = '';

  if (settings.PREVIEW === true) {
    serverUrl = settings.SERVER_URL;
  } 

  let srcset = `${serverUrl}${imageUrls['1x']} 250w, ${serverUrl}${imageUrls['2x']} 500w, ${serverUrl}${imageUrls['4x']}, 1000w`;
  

  if (settings.OPTIONS.doNotBuildLargeImages === true) {
    srcset = `${serverUrl}${imageUrls['1x']} 250w, ${serverUrl}${imageUrls['2x']} 500w`;
  }
  return srcset;
}