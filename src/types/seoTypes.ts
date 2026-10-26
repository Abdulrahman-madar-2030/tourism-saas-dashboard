export interface Root {
  seo: Seo;
}

export interface Seo {
  metaTitle: string;
  alt?: string;
  metaDescription: string;
  keywords: string | string[];
  slugUrl: string;
  priority: number | string;
  changeFrequency: string;
  noIndex: boolean | string;
  noFollow: boolean | string;
  noArchive: boolean | string;
  noSnippet: boolean | string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  [key: string]: unknown;
}
