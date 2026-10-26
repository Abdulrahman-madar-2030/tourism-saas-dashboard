import { Seo } from "@/types/seoTypes";

export interface Root {
  status: string;
  results: number;
  data: Data;
}

export interface Data {
  data: Hotel[];
}

export interface Hotel {
  _id: string;
  hotel_id: string;
  hotel_name: string;
  hotel_translated_name?: string;
  addressline1?: string;
  zipcode?: string;
  city: string; // Store as string based on schema "city: { type: String, index: true }"
  city_translated?: string;
  state?: string;
  country: string; // Store as string based on schema "country: { type: String, index: true }"
  countryisocode?: string;
  continent_name?: string;
  longitude?: number;
  latitude?: number;
  star_rating?: number;
  number_of_reviews?: number;
  rating_average?: number;
  numberrooms?: number;
  numberfloors?: number;
  checkin?: string;
  checkout?: string;
  url?: string;
  photo1?: string;
  photo2?: string;
  photo3?: string;
  photo4?: string;
  photo5?: string;
  overview?: string;
  city_id?: string;
  country_id?: string;
  slug?: string;
  seo?: Seo;
  createdBy?: string;
  updatedBy?: string;
}

export interface HotelForm {
  _id?: string;
  hotel_name: string;
  hotel_translated_name?: string;
  overview?: string;
  slug?: string;
  seo?: Seo;
  latitude?: number;
  longitude?: number;
  lat?: number;
  lng?: number;
}

export interface HotelItem {
  _id?: string;
  hotelId: string;
  name: string;
  currency?: string;
  price?: number;
  image: string;
  rating: number;
  ratingWord: string;
  stars: number;
  address: string;
  distance?: string;
  url?: string;
  city: string;
  source?: string;
  slug?: string;
  overview?: string;
  seo?: Seo;
  type?: "hotel" | "villa" | "cabin";
  description?: string;
  cityId?: string;
  view?: string;
  mealPlan?: string;
  hasJacuzzi?: boolean;
  hasPrivatePool?: boolean;
  latitude?: number;
  longitude?: number;
  lat?: number;
  lng?: number;
  phone?: string;
  website?: string;
  openingHours?: string;
  reviewsCount?: number;
  lastFetchedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  rooms?: Array<{
    roomType?: string;
    bedType?: string;
    [key: string]: any;
  }>;
}

export interface HotelResponseData {
  hotels: HotelItem[];
  meta?: {
    map_title?: string;
    count?: number;
  };
}
