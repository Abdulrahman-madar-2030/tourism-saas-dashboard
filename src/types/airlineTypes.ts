export interface Root {
  status: string;
  results: number;
  data: Data;
}

export interface Data {
  data: Airline[];
}

export interface Airline {
  seo: Seo;
  _id: string;
  name: string;
  imageCover: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  slug: string;
  alt: string;
  updatedBy: string;
}

export interface Seo {
  changeFrequency: string;
  noIndex: boolean | string;
  noFollow: boolean | string;
  noArchive: boolean | string;
  noSnippet: boolean | string;
}
