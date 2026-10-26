export interface Root {
  status: string;
  results: number;
  data: Data;
}

export interface Data {
  data: Country[];
}

export interface Country {
  seo: Seo;
  _id: string;
  name: string;
  continent: string;
  currency: string;
  language: string;
  description: string;
  descText: string;
  favMonth: string[];
  isActive: boolean;
  images: string[];
  imageCover: string;
  slug: string;
  alt: string;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Seo {
  priority: number;
  changeFrequency: string;
  noIndex: string;
  noFollow: string;
  noArchive: string;
  noSnippet: string;
  keywords: string | string[];
  metaTitle?: string;
  metaDescription?: string;
  slugUrl?: string;
  [key: string]: unknown;
}

export interface CountryFormValues {
  _id?: string; // add this
  name: string;
  continent: string;
  currency: string;
  language: string;
  shortDescription: string;
  description: string;
  bestTimeToVisit: string;
  VisaRequirements: string;
  tripDuration: string;
  tourGuide: string;
  slug: string;
  isPopular: boolean;
  imageCover: { url: string; alt: string } | File | null;
  imageCoverAlt?: string;
  images: { url: string; alt: string }[] | File[];
  seo?: Seo;
  countryInfo?: any;
}

export interface CountryInfo {
  _id: string;
  title: string;
  solution: string;
  description: string;
  country?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CountryInfoForm {
  title: string;
  solution: string;
  description: string;
}

export interface CountryFAQ {
  _id: string;
  question: string;
  answer: string;
  displayOrder: number;
  isActive: boolean;
  country?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CountryFAQForm {
  question: string;
  answer: string;
  displayOrder: number;
  isActive: boolean;
}
