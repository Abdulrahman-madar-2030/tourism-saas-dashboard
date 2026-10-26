export interface Root {
  status: string;
  results: number;
  data: Data;
}

export interface Data {
  data: City[];
}

export interface City {
  coordinates: Coordinates;
  weather?: Weather;
  seo: Seo;
  _id: string;
  name: string;
  country: CityCountry | string;
  description: string;
  shortDescription: string;
  bestTimeToVisit: string;
  tourGuide: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
  slug: string;
  imageCover: { url: string; alt: string } | string | null;
  images: { url: string; alt: string }[] | string[];
}

export interface CityForm {
  _id?: string;
  seo?: Seo;
  name: string;
  country: string;
  description: string;
  shortDescription?: string;
  bestTimeToVisit?: string;
  tourGuide?: string;
  lat?: string;
  lon?: string;
  imageCover: { url: string; alt: string } | File | null;
  imageCoverAlt?: string;
  images: { url: string; alt: string }[] | File[];
  slug: string;
}

export interface Coordinates {
  lat: number;
  lon: number;
}

export interface Weather {
  isAutoUpdate: boolean;
}

export interface CityCountry {
  _id: string;
  name: string;
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
