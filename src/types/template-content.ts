import type { ImageWithTextAndLicence, Page } from 'localcosmos-client';

export type ContentParagraph = {
  heading?: string,
  text: string,
  image?: ImageWithTextAndLicence,
}

export type ContentVideo = {
  url: string,
  videoType: 'YouTube' | 'Vimeo',
  title: string,
  caption?: string,
  altText?: string,
}

export type StreamContentVideo = ContentVideo & {
  templateName: 'Video',
}


export type TextBlock = {
  text: string,
  templateName: 'TextBlock',
  image?: ImageWithTextAndLicence,
}

export type Heading = {
  templateName: 'Heading',
  heading: string,
}
export type ArticleStream = (TextBlock | StreamContentVideo | Heading)[];


export type TemplateContentPreviewData = {
  title: string,
  templateName: string,
  slug: string,
  previewImage: string | null,
  featuredImage: string | null,
  abstract: string | null,
}

export type  MultiversePage = Page & {
  previewImage?: string | null,
  featuredImage?: string | null,
  abstract?: string | null,
}