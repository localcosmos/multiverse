export function useVideoUrl() {

  const extractYoutubeId = (url: string): string | null => {
    const fromQuery = url.match(/[?&]v=([^&#]*)/);
    if (fromQuery?.[1]) return fromQuery[1];

    const fromShortUrl = url.match(/youtu\.be\/([^?&#]*)/);
    if (fromShortUrl?.[1]) return fromShortUrl[1];

    const fromEmbed = url.match(/youtube\.com\/embed\/([^?&#]*)/);
    if (fromEmbed?.[1]) return fromEmbed[1];

    // Raw 11-character ID
    if (/^[a-zA-Z0-9_-]{11}$/.test(url)) return url;

    return null;
  };

  const extractVimeoId = (url: string): string | null => {
    const fromUrl = url.match(/vimeo\.com\/(\d+)/);
    if (fromUrl?.[1]) return fromUrl[1];

    // Raw numeric ID
    if (/^\d+$/.test(url)) return url;

    return null;
  };

  // Returns the privacy hash from URLs like https://vimeo.com/123456789/abc123def
  const extractVimeoHash = (url: string): string | null => {
    const hashMatch = url.match(/vimeo\.com\/\d+\/([a-f0-9]+)/);
    return hashMatch?.[1] ?? null;
  };

  const getYoutubeEmbedUrl = (url: string): string => {
    const id = extractYoutubeId(url);
    return `https://www.youtube.com/embed/${id ?? url}?cc_load_policy=0&rel=0`;
  };

  const getVimeoEmbedUrl = (url: string, extraParams = 'dnt=1'): string => {
    const id = extractVimeoId(url);
    const hash = extractVimeoHash(url);
    const hashParam = hash ? `&h=${hash}` : '';
    return `https://player.vimeo.com/video/${id ?? url}?${extraParams}${hashParam}`;
  };

  // Convenience helper used by VideoEmbed
  const getEmbedUrl = (url: string, videoType: string): string => {
    if (videoType === 'Vimeo') return getVimeoEmbedUrl(url);
    if (videoType === 'YouTube') return getYoutubeEmbedUrl(url);
    return url; // Direct / mp4 / webm
  };

  // Fetches the thumbnail URL via the Vimeo oEmbed API.
  // Includes the privacy hash in the request URL when present.
  const fetchVimeoThumbnail = async (url: string): Promise<string | null> => {
    const id = extractVimeoId(url);
    if (!id) return null;

    const hash = extractVimeoHash(url);
    const vimeoUrl = hash
      ? `https://vimeo.com/${id}/${hash}`
      : `https://vimeo.com/${id}`;

    try {
      const response = await fetch(
        `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(vimeoUrl)}`
      );
      if (!response.ok) return null;
      const data = await response.json();
      return (data.thumbnail_url as string) ?? null;
    } catch {
      return null;
    }
  };

  return {
    extractYoutubeId,
    extractVimeoId,
    extractVimeoHash,
    getYoutubeEmbedUrl,
    getVimeoEmbedUrl,
    getEmbedUrl,
    fetchVimeoThumbnail,
  };
}
