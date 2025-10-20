import type { ImageWithTextAndLicence } from 'localcosmos-client';

export type ContentParagraph = {
  heading?: string;
  text: string;
  image?: ImageWithTextAndLicence;
}

export type ContentVideo = {
  url: string,
  videoType: 'YouTube' | 'Vimeo',
  title: string,
  caption?: string,
  altText?: string
}


export type TextBlock = {
  text: string;
  image?: ImageWithTextAndLicence;
}

export type Heading = {
  heading: string
}
export type ArticleStream = (TextBlock | ContentVideo | Heading)[];