import { inject } from 'vue';
import type { FrontendSettings } from 'localcosmos-client';

/*
    <meta http-equiv="Content-Security-Policy"
      content="default-src 'self' app://localhost data: blob: gap: 'unsafe-eval' 'unsafe-inline';
               frame-src https://player.vimeo.com https://*.vimeo.com https://www.youtube.com https://youtube.com;
               connect-src 'self' app://localhost https://vimeo.com https://*.vimeo.com https://*.vimeocdn.com https://www.youtube.com;
               img-src 'self' app://localhost data: blob: https://*.vimeocdn.com https://*.ytimg.com;
               media-src 'self' blob: https://*.vimeocdn.com;">
*/

export function useContentSecurityPolicy() {
  const settings = inject('settings') as FrontendSettings;

  const meta = document.createElement('meta');
  meta.httpEquiv = 'Content-Security-Policy';
  meta.content = `default-src 'self' data: ${settings.API_URL} https://creativecommons.org; \
style-src 'self' 'unsafe-inline'; \
frame-src https://player.vimeo.com https://*.vimeo.com https://www.youtube.com https://youtube.com; \
img-src 'self' data: content: blob: https: ${settings.MEDIA_URL} https://*.openstreetmap.org https://tile.gbif.org https://api.gbif.org https://*.vimeocdn.com https://*.ytimg.com; \
connect-src 'self' blob: ${settings.API_URL} https://api.gbif.org https://vimeo.com https://*.vimeo.com https://*.vimeocdn.com https://www.youtube.com; \
media-src 'self' blob: https: https://*.vimeocdn.com`;
  document.getElementsByTagName("head")[0].prepend(meta);
}
