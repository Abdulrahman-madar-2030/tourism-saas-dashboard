export interface Root {
  status: string;
  results: number;
  data: Data;
}

export interface Data {
  data: Blog[];
}

export interface Blog {
  _id?: string;
  title?: string;
  content?: string;
  excerpt?: string;
  tags?: string[];
  slug?: string;
  imageCover?:
    | {
        url: string;
        alt: string;
      }
    | string
    | File;
  alt?: string;
  seo?: Seo;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface BlogForm {
  _id?: string;
  title?: string;
  content?: string;
  excerpt?: string;
  tags?: string[] | string;
  imageCover: File | string | { url: string; alt: string };
  slug?: string;
  alt?: string;
  seo?: Seo;
}

export interface Seo {
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string | string[];
  slugUrl?: string;
  priority?: string | number;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  changeFrequency?: string;
  noIndex?: string | boolean;
  noFollow?: string | boolean;
  noArchive?: string | boolean;
  noSnippet?: string | boolean;
}
