import { Branch } from "./branches";

export interface Root {
  status: string;
  results: number;
  data: Data;
}

export interface Data {
  pkg: Pkg;
  branches: Branch[];
}

export interface PackageImage {
  url: string;
  publicId?: string;
  alt?: string;
}

export const ACCOMMODATION_TYPES = ["hotel", "cabin", "villa"] as const;
export type AccommodationType = (typeof ACCOMMODATION_TYPES)[number];

export const ACCOMMODATION_VIEWS = {
  hotel: ['بحر', 'مدينة', 'جبال', 'فناء داخلي', 'حديقة'],
  cabin: ['نهر', 'بحر', 'جبال', 'سهول'],
  villa: ['بحر', 'جبال']
} as const;

export const MEAL_PLANS = [
  'إفطار فقط',
  'إفطار وعشاء',
  'إفطار وغداء وعشاء',
  'شامل جميع الوجبات'
] as const;
export type MealPlan = (typeof MEAL_PLANS)[number];

export const HOTEL_ROOM_TYPES = [
  'دابل',
  'سوبريور',
  'ديلوكس',
  'دابل سويت',
  'غرفه عائليه',
  'جناح عائلي'
] as const;
export type HotelRoomType = (typeof HOTEL_ROOM_TYPES)[number];

export const HOTEL_BED_TYPES = [
  'فردي',
  'سريرين منفصلين',
  'مزدوج',
  'سرير كوين',
  'سرير كينغ',
] as const;
export type HotelBedType = (typeof HOTEL_BED_TYPES)[number];

export interface PackageHotelRoom {
  hotelId?: string;
  roomType: HotelRoomType | string;
  bedType: HotelBedType | string;
}

export interface PackageHotel {
  hotel?: string;
  name: string;
  link?: string;
  url?: string;
  meals: string[];
  stars?: number;
  rating?: number;
  ratingWord?: string;
  price?: number;
  currency?: string;
  city?: string;
  cityId?: string;
  address?: string;
  image?: string;
  type?: AccommodationType | string;
  view?: string;
  mealPlan?: MealPlan | string;
  hasJacuzzi?: boolean;
  hasPrivatePool?: boolean;
  pool?: boolean | string;
  jacuzzi?: boolean | string;
  description?: string;
  calendar?: string;
  rooms?: PackageHotelRoom[];
}

export interface PackageOffer {
  oldPrice?: number;
  newPrice: number;
  startDate?: string;
  endDate?: string;
}

export interface PackageFlight {
  airline: string | { _id: string; name: string };
  flightNumber: string;
  from: string;
  to: string;
  departureDate?: string;
  departureTime?: string;
  arrivalDate?: string;
  arrivalTime?: string;
}

export interface PracticalInfoItem {
  title: string;
  value: string;
  icon: string;
}

export interface PackageSeo {
  title?: string;
  description?: string;
  keywords?: string[] | string;
  changeFrequency?: string;
  noIndex?: boolean | string;
  noFollow?: boolean | string;
  noArchive?: boolean | string;
  noSnippet?: boolean | string;
  slugUrl?: string;
}

export interface Pkg {
  ratingsAverage?: number;
  ratingsQuantity?: number;
  _id: string;
  name: string;
  packageType: PackageType | string;
  country: Country | string;
  cities?: City[];
  description: string;
  descText?: string;
  imageCover?: PackageImage | string;
  images?: (PackageImage | string)[];
  includes?: string[] | any[];
  excludes?: string[] | any[];
  hotels?: PackageHotel[];
  hotelIds?: string[];
  accommodations?: any[];
  offer?: PackageOffer;
  flights?: PackageFlight[];
  practicalInfo?: PracticalInfoItem[];
  seo?: PackageSeo;
  isActive?: boolean;
  slug?: string;
  id?: string;
}

export interface PackageType {
  _id: string;
  name: string;
  slug?: string;
}

export interface Country {
  _id: string;
  name: string;
  slug?: string;
  id?: string;
}

export interface City {
  _id: string;
  name: string;
  slug?: string;
}

export interface PackageForm {
  _id?: string;
  name: string;
  packageType: string;
  country: string;
  description: string;
  isActive?: boolean;
  slug?: string;
  alt?: string;
  imageCover?: File | PackageImage | null;
  coverImage?: File | PackageImage | null;
  imageCoverAlt?: string;
  images?: (File | PackageImage)[];
  includes?: string[];
  excludes?: string[];
  inclusions?: { value: string }[];
  exclusions?: { value: string }[];
  hotels?: PackageHotel[];
  hotelIds?: string[];
  accommodations?: any[];
  offer?: PackageOffer;
  flights?: PackageFlight[];
  practicalInfo?: PracticalInfoItem[];
  seo?: PackageSeo;

  // Legacy / compatibility properties
  price?: string | { amount: string | number; currency: string };
  header?: Header;
  cities?: string[] | City[];
  descText?: string;
  shortDescription?: string;
  cityNames?: string[];
  packagesCount?: number;
  duration?: string;
  city?: string;
  cancellationPolicy?: { type: string; description: string };
}

export interface Seo {
  changeFrequency?: string;
  noIndex?: boolean | string;
  noFollow?: boolean | string;
  noArchive?: boolean | string;
  noSnippet?: boolean | string;
  title?: string;
  description?: string;
  keywords?: string[] | string;
  slugUrl?: string;
}

export interface Header {
  dayNumber?: string;
  nights?: string;
  location?: string;
  _id?: string;
}

export interface Itinerary {
  day: number;
  title: string;
  description: string;
  _id?: string;
}

