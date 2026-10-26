export interface Root {
  status: string;
  results: number;
  data: Data;
}

export interface Data {
  data: PackagesCategory[];
}

export interface PackagesCategory {
  seo: Seo;
  _id: string;
  name: string;
  description: string;
  imageCover: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  slug: string;
  alt: string;
}

export interface PackageTypeForm {
  _id?: string;
  name?: string;
  description?: string;
  descText?: string;
  imageCover?: any;
  images?: File[];
  countries?: string[];
  seo?: Seo;
  alt?: string;
  slug?: string;
  isActive?: boolean;
}

export interface Seo {
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string;
  slugUrl?: string;
  priority?: number | string;
  changeFrequency?: string;
  noIndex?: boolean | string;
  noFollow?: boolean | string;
  noArchive?: boolean | string;
  noSnippet?: boolean | string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
}
