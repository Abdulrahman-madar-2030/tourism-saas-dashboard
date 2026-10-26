export interface SeoResponse {
  status: string;
  results: number;
  data: SeoRoot;
}

export interface SeoRoot {
  data: SeoPage[];
}

export interface SeoPage {
  _id?: string;
  id?: string;
  pageName?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  descText?: string;
  sections?: Record<string, { title?: string; content?: string }>;
  seo?: Seo;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface SectionFormItem {
  name: string;
  title?: string;
  content?: string;
}

export interface Seo {
  priority: number | string;
  changeFrequency: string;
  noIndex: string | boolean;
  noFollow: string | boolean;
  noArchive: string | boolean;
  noSnippet: string | boolean;
  slugUrl: string;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
}

export interface SeoPageForm {
  _id?: string;
  pageName?: string;
  title?: string;
  description?: string;
  sections?: SectionFormItem[];
  slug?: string;
  seo?: Seo;
}
